/**
 * Restful api 测试模板
 */
import {OpenApi3, default as OpenApi3Spec} from "../spec/openapi-3";
import {pluralize} from "inflected";

const ErrorModel: OpenApi3.SchemaObject = {
	type: "object",
	properties: {
		name: {
			type: "string",
		},
		message: {
			type: "string",
		},
	},
};

export default class BaseRestfulTemplate {
	private name: string;
	private zhName: string;
	private model: OpenApi3.SchemaObject;
	private modelExample: object;
	private spec: OpenApi3Spec = new OpenApi3Spec();

	createOperation(): OpenApi3.OperationObject {
		const {id, ...propsWithoutId} = this.model.properties;

		const modelWithoutId = {
			...this.model,
			...{
				properties: propsWithoutId,
			},
		};

		return {
			"tags": [
				this.name,
			],
			"summary": `Create ${this.name.toLowerCase()}`,
			"description": "新建" + this.zhName,
			"operationId": `create${this.name}`,
			"requestBody": {
				"description": this.zhName,
				"content": {
					"application/json": {
						"schema": modelWithoutId,
						examples: {
							"CreateExample": {
								summary: "新建" + this.zhName + "示例",
								value: this.modelExample,
							},
						},
					},

				},
				"required": true,
			},
			"responses": {
				"200": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/" + this.name,
							},
						},
					},
				},
			},
		};
	}

	listOperation(): OpenApi3.OperationObject {

		return {
			"tags": [
				this.name,
			],
			"summary": `List ${pluralize(this.name).toLowerCase()}`,
			"description": `获取${this.zhName}列表`,
			"operationId": `list${pluralize(this.name)}`,
			"parameters": [
				{
					"name": "limit",
					"in": "query",
					"description": "返回数量",
					"required": false,
					"schema": {
						"type": "integer",
						"example": 10,
					},
				},
				{
					"name": "offset",
					"in": "query",
					"description": "偏移量",
					"required": false,
					"schema": {
						"type": "integer",
						"example": 0,
					},
				},
			],
			"responses": {
				"200": {
					"description": "OK",
					"headers": {
						"X-Total": {
							"schema": {
								"description": "当前查询包含的总数",
								"type": "integer",
							},
						},
					},
					"content": {
						"application/json": {
							"schema": {
								"type": "array",
								"items": {
									"$ref": `#/components/schemas/${this.name}`,
								},
							},
						},
					},
				},
			},
		};
	}

	getOperation(): OpenApi3.OperationObject {

		return {
			"tags": [
				this.name,
			],
			"summary": `Get ${this.name.toLowerCase()} by id`,
			"description": "获取" + this.zhName,
			"operationId": `get${this.name}ById`,
			"parameters": [
				{
					"in": "path",
					name: "id",
					"description": this.zhName + "id",
					"required": true,
					"schema": {
						"type": "string",
					},
				},
			],
			"responses": {
				"200": {
					description: "OK",
					"content": {
						"application/json": {
							"schema": {
								"$ref": `#/components/schemas/${this.name}`,
							},
						},
					},
				},
				"404": {
					description: "NotFound",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/Error",
							},
						},
					},
				},
			},
		};
	}

	updateOperation(): OpenApi3.OperationObject {
		const {id, ...propsWithoutId} = this.model.properties;

		const modelWithoutId = {
			...this.model,
			...{
				properties: propsWithoutId,
			},
		};
		return {
			"tags": [
				this.name,
			],
			"summary": `Update ${this.name.toLowerCase()} by id`,
			"description": "更新" + this.zhName,
			"operationId": `update${this.name}ById`,
			"parameters": [
				{
					"in": "path",
					name: "id",
					"description": this.zhName + "id",
					"required": true,
					"schema": {
						"type": "string",
					},
				},
			],
			"requestBody": {
				"description": this.zhName,
				"content": {
					"application/json": {
						"schema": modelWithoutId,
						"examples": {
							"UpdateExample": {
								summary: "更新" + this.zhName + "示例",
								value: this.modelExample,
							},
						},
					},
				},
			},
			"responses": {
				"200": {
					description: "OK",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/" + this.name,
							},
						},
					},
				},
				"404": {
					description: "NotFound",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/Error",
							},
						},
					},
				},
			},
		};
	}

	deleteOperation(): OpenApi3.OperationObject {
		return {
			"tags": [
				this.name,
			],
			"summary": "Delete " + this.name.toLowerCase() + " by id",
			"description": "删除" + this.zhName,
			"operationId": "delete" + this.name,
			"parameters": [
				{
					"in": "path",
					name: "id",
					"description": this.zhName + "id",
					"required": true,
					"schema": {
						"type": "string",
					},
				},
			],
			"responses": {
				"204": {
					"description": "Delete Ok",
				},
				"404": {
					description: "NotFound",
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/Error",
							},
						},
					},
				},
			},
		};
	}

	constructor(resource: string,
							zhResource: string,
							spec: OpenApi3Spec,
							model: OpenApi3.SchemaObject,
							modelExample: object,
	) {
		this.name = resource;
		this.zhName = zhResource;
		this.model = model;
		this.spec = spec;
		this.modelExample = modelExample;
	}

	genDoc(methods: string[] = ["create", "list", "get", "update", "delete"]) {
		if (methods.length === 0) {
			return;
		}

		this.spec.tag({name: this.name, description: "Restful api of " + this.name});
		this.spec.component(this.name, this.model);
		this.spec.component("Error", ErrorModel);

		if (methods.indexOf("create") !== -1) {
			// 新建
			const createPath = `/${this.name.toLowerCase()}`;
			this.spec.path(createPath);
			this.spec.operation(createPath, "post", this.createOperation());
		}

		if (methods.indexOf("list") !== -1) {
			// list
			const listPath = `/${this.name.toLowerCase()}`;
			this.spec.path(listPath);
			this.spec.operation(listPath, "get", this.listOperation());
		}

		if (methods.indexOf("get") !== -1) {
			// get
			const getPath = `/${this.name.toLowerCase()}/{${this.name.toLowerCase()}Id}`;
			this.spec.path(getPath);
			this.spec.operation(getPath, "get", this.getOperation());
		}

		// update
		if (methods.indexOf("update") !== -1) {
			const updatePath = `/${this.name.toLowerCase()}/{${this.name.toLowerCase()}Id}`;
			this.spec.path(updatePath);
			this.spec.operation(updatePath, "put", this.updateOperation());
		}

		// delete
		if (methods.indexOf("delete") !== -1) {
			const deletePath = `/${this.name.toLowerCase()}/{${this.name.toLowerCase()}Id}`;
			this.spec.path(deletePath);
			this.spec.operation(deletePath, "delete", this.deleteOperation());
		}
	}
}