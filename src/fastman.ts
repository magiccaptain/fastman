import {OpenApi3, default as OpenApi3Spec} from "./spec/openapi-3";
import {Swagger} from "./spec/openapi-2";
import Spec from "./spec/base";
import {Postman} from "./postman";
import NewmanRunner from "./runner/newman-runner";
import queryString = require("query-string");
import {Promise} from "es6-promise";
import fs =require("fs");
import path = require("path");
import _ = require("lodash");


import URL = require("url");


export type Resource = OpenApi3.PathItemObject | Swagger.Path | any;
export type Info = OpenApi3.InfoObject | Swagger.Info | any;
export type Operation = OpenApi3.OperationObject | Swagger.Operation | any;
export type SecurityScheme = OpenApi3.SecuritySchemeObject | Swagger.Security | any;
export type Server = OpenApi3.ServerObject | Swagger.Server | any;
export type Response = OpenApi3.ResponseObject | Swagger.Response | any;
export type Component = OpenApi3.Component | Swagger.Schema | any;
export type Example = OpenApi3.ExampleObject | Swagger.Example | any;

export interface TestCase {
	name: string,               // 测试用例名
	request?: Postman.Request,
	response?: Postman.Response,
	// 是否将测试结果写入 文档中的 example 和 postman collection文件中
	save?: boolean,
	// 是否将测试用例中的request body 写入文档的example
	saveRequest?: boolean
	// 是否 不导出到postman
	excludePostman?: boolean,
	// url参数
	params?: string[]
	// query 参数 key:value 格式
	query?: object,
	// body 参数 key:value 格式
	body?: object,
	// header 参数 key:value 格式
	header?: object
}

export interface GlobalHeader {
	all?: object,
	get?: object,
	post?: object,
	put?: object,
	delete?: object,
	head?: object,
	patch?: object
}

interface FastmanState {
	url?: string,
	resource?: string,
	path?: string,
	operation?: string,
	response?: string,
	// 不同method下的全局header， all为所有method公用的header
	globalHeader?: GlobalHeader,
	// 通过的测试用例, 以resource/path/operation/response 为索引
	passedCases?: { [name: string]: TestCase },
	// 当前的测试用例
	testCase?: TestCase,
	// 当前的except 函数
	except?: (resp) => {}
}


export function getComponentRef(name: string, type: string = "schemas") {
	return `#/components/${type}/${name}`;
}


export default class Fastman {
	private state: FastmanState = {
		passedCases: {},
		globalHeader: {},
	};

	private spceVersion = 3;
	public spec: Spec = null;

	private runner?: NewmanRunner = null;

	/**
	 * 指定使用openapi版本
	 * @param {number} version
	 */
	openApiVersion(version: number): Fastman {
		this.spceVersion = version;
		if (this.spceVersion === 3) {
			this.spec = new OpenApi3Spec();
		} else {
			// this.spec = new OpenApi2Spec();
		}
		return this;
	}

	/**
	 * 将openapi文档写入字符串
	 * @returns {string}
	 */
	writeSpec(): string {
		return this.spec.write("yaml");
	}

	/**
	 * 设置openapi的info
	 */
	public info(info: Info): Fastman {
		this.spec.info(info);
		return this;
	}

	public component(name: string, value: Component, type?: string) {
		this.spec.component(name, value, type);
		return this;
	}

	/**
	 * 从给定字符串或object中读取 文档
	 * @param {string | object} spec
	 * @returns {this}
	 */
	public load(spec: string | object) {
		this.spec.load(spec);
		const servers = this.spec.server();
		this.state.url = servers[0].url || servers[0].basePath;
		if (!this.state.url) {
			throw new Error("文档中需要配置Server");
		}
		return this;
	}

	public response(status, response?: Response) {
		if (typeof status === "number") {
			status = status.toString();
		}

		this.spec.response(status, this.state.path, this.state.operation, response);
		this.state.response = status;
		return this;
	}

	/**
	 * 选择或新建一个资源
	 * @param name 资源名称
	 */
	public resource(name: string) {
		this.state = {
			...this.state,
			...{
				resource: name,
				path: null,
				operation: null,
				response: null,
			},
		};
		return this;
	}

	/**
	 * 选择或新建一个路径
	 * @param {string} path
	 */
	public path(path: string) {
		this.spec.path(path);
		this.state = {
			...this.state,
			...{
				path: path,
				operation: null,
				response: null,
			},
		};
		return this;
	}

	/**
	 * 设置全局的headers
	 * @param {object} headers
	 */
	public globalHeaders(headers: GlobalHeader) {
		this.state.globalHeader = {...this.state.globalHeader, ...headers};
		return this;
	}

	/**
	 * 配置Server
	 * @param {Server} server
	 */
	public server(server: Server) {
		this.spec.server(server);
		this.state.url = server.url || server.basePath;
		return this;
	}

	/**
	 * 选择或新建一个操作
	 * @param {string} method
	 * @param operation
	 */
	public operation(method: string, operation?: Operation) {
		if (operation) {
			const tags = operation.tags || [];
			tags.push(this.state.resource);
			operation.tags = tags;
		}
		this.spec.operation(this.state.path, method, operation);
		this.state = {
			...this.state,
			...{
				operation: method,
				response: null,
			},
		};
		return this;
	}

	/**
	 * 准备测试用例
	 */
	public testCase(testCase: TestCase) {
		if (!this.state.url) throw  "没有找到server配置";
		const url = URL.parse(this.state.url);

		// 去掉path中的所有参数
		const re = /\/\{\w+\}/g;
		url.pathname += this.state.path.replace(re, "");
		if (testCase.params) {
			url.pathname += "/" + testCase.params.join("/");
		}
		const protocol = url.protocol.replace(":", "");

		let postmanQuery;
		if (testCase.query) {
			url.query = queryString.stringify(testCase.query);
			postmanQuery = Object.keys(testCase.query).map(k => {
				return {
					key: k,
					value: testCase.query[k],
				};
			});
		}

		const raw = URL.format({
			protocol: protocol,
			hostname: url.hostname,
			port: url.port,
			query: testCase.query,
			pathname: url.pathname,
		});

		const postManUrl: Postman.Url = {
			raw: raw,
			protocol: protocol,
			port: url.port,
			host: [url.hostname],
			path: url.pathname.slice(1).split("/"),
			query: postmanQuery,
		};


		const testHeader = {
			...this.state.globalHeader.all,
			...this.state.globalHeader[this.state.operation],
			...testCase.header,
		};

		const postmanHeader = Object.keys(testHeader).map(k => {
			return {
				key: k,
				value: testHeader[k],
			};
		});

		// FIXME 目前只支持 json 格式的 body, 需要对多种类型的body进行处理
		// 构建body
		const postmanBody: Postman.RequestBody =
			testCase.body ?
				{
					mode: "raw",
					raw: JSON.stringify(testCase.body, null, "\t"),
				} : {};


		// 构建Request
		testCase.request = {
			url: postManUrl,
			header: postmanHeader,
			body: postmanBody,
			method: this.state.operation,
		};


		this.state.testCase = testCase;
		this.state.except = null;
		return this;
	}


	public except(expect) {
		this.state.except = expect;
		return this;
	}

	private getCaseKey(name) {
		const {resource, path, operation, response} = this.state;
		return `${resource}:${path}:${operation}:${response}:${name}`;
	}

	/**
	 * 导出postman 结果，将测试的结果保存在postman的collection文件中
	 * 如果给出的file不存在，则会新建一个collection文件
	 * 如果file存在，则会在collection中按照 resource 分文件夹存放测试用例
	 *
	 * 同时，会自动将 host port bearer 等转换为postman的环境格式
	 * @param {string} file 保存文件的路径
	 */
	public exportPostman(file: string) {
		const {passedCases} = this.state;
		let resources = Object.keys(passedCases)
			.map(k => k.split(":")[0]);

		resources = _.uniq(resources);

		const url = URL.parse(this.state.url);
		const hostname = url.hostname;
		const port = url.port;

		const collection = fs.existsSync(file) ?
			JSON.parse(fs.readFileSync(file).toString()) :
			{
				info: {
					name: "FastmanAutoGen",
					schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
				},
				item: [],
			};


		for (let r of resources) {
			const resource = {
				name: r,
				item: [],
			};
			const cases = Object
				.keys(passedCases)
				.filter(k => k.split(":")[0] === r)
				.map(k => passedCases[k])
				.filter(k => !k.excludePostman);


			resource.item = cases.map(c => {
				const url: Postman.Url = {
					...c.request.url,
					...{
						raw: c.request.url.raw
							.replace(hostname, "{{host}}")
							.replace(port, "{{port}}"),
						port: "{{port}}",
						host: ["{{host}}"],
					},
				};

				// 处理request下的header
				c.request.header = c.request.header.map(h => {
					if (h.key === "Authorization") {
						if (h.value.indexOf("Bearer") !== -1) {
							h["value"] = "Bearer {{bearer_token}}";
						} else {
							// TODO 处理其他需要写成环境变量的token
							return h;
						}
					}
					return h;
				});

				let responseBody = {};

				try {
					responseBody = c.response["json"]();
				} catch (e) {
					responseBody = {};
				}

				return {
					name: c.name,
					request: {
						...c.request,
						...{url},
					},
					response: [
						{
							name: c.name,
							originalRequest: {
								...c.request,
								...{url},
							},
							status: c.response.status,
							code: c.response.code,
							header: c.response["headers"]["members"],
							cookies: c.response["cookies"]["members"],
							body: JSON.stringify(responseBody, null, "\t"),
						},
					],
				};
			});

			_.remove(collection.item, i => i["name"] === r);
			collection.item.push(resource);
		}
		fs.writeFileSync(file, JSON.stringify(collection, null, 2));
	}

	/**
	 * 测试
	 */
	public run(): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			if (!this.runner) {
				this.runner = new NewmanRunner();
			}

			this.runner.run(this.state.testCase, this.getCaseKey(this.state.testCase.name))
				.then((resp: any) => {
					try {
						// 验证status 是否满足
						if (resp.code != this.state.response) {
							reject(new Error(`Response except ${this.state.response}, but receive ${resp.code}`));
						}

						// 验证是否通过
						if (this.state.except) {
							this.state.except(resp);
						}
						const {testCase} = this.state;
						testCase.response = resp;

						// 将结果保存在文档的example中
						if (testCase.save && resp.code !== 204) {

							const example: Example = {
								value: resp.json(),
							};

							this.spec.example(testCase.name,
								example,
								this.state.path,
								this.state.operation,
								this.state.response);


							if (testCase.saveRequest && testCase.body) {
								const requestExample: Example = {
									summary: testCase.name,
									value: testCase.body,
								};

								this.spec.requestExample(
									testCase.name,
									requestExample,
									this.state.path, this.state.operation);
							}

						}

						// 保存通过的testcase
						this.state.passedCases[this.getCaseKey(testCase.name)]
							= testCase;
						resolve(resp);
					} catch (e) {
						reject(e);
					}
				})
				.catch(e => reject(e));
		});

	}
}

