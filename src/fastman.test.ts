import "mocha";
import Fastman from "./fastman";
import chai = require("chai");
import fs = require("fs");
import path = require("path");
import yaml = require("js-yaml");

const assert = chai.assert;

const fastman = new Fastman();

const specPath = path.join(__dirname, "..", "example", "example.yaml");
const postmanPath = path.join(__dirname, "..", "example", "postman");

const spec = yaml.safeLoad(fs.readFileSync(specPath).toString("utf8"));
let user = null;


describe("Test fastman", function () {
	before(function () {
		fastman
			.openApiVersion(3)
			.load(spec)
			.globalHeaders({
				post: {
					"Content-Type": "application/json",
				},
				put: {
					"Content-Type": "application/json",
				},
			})
			.resource("Users");

	});

	after(function () {
		const testedDocPath = path.join(__dirname, "..", "example", "example_tested.yaml");
		fs.writeFileSync(testedDocPath, fastman.writeSpec());
		fastman.exportPostman(postmanPath);
	});

	it("Test list users", function (done) {
		fastman
			.path("/users")
			.operation("get")
			.response("200")
			.testCase({
				name: "ListUserOK",
				save: true,
				query: {
					offset: 0,
					limit: 10,
				},
			})
			.except((resp) => {
				let body = resp.json();
				assert.equal(body.length, 10);
				// const xTotal = resp.headers.get("X-Total");
			})
			.run()
			.then(resp => {
				done();
			})
			.catch(e => {
				done(e);
			});
	});

	it("Test create user", function (done) {
		fastman
			.path("/users")
			.operation("post")
			.response("200")
			.testCase({
				name: "CreateUerOK",
				save: true,
				body: {
					name: "Shao Chen",
				},
			})
			.except((resp) => {
				const body = resp.json();
				assert.exists(body.id);
				user = body.id;
				assert.equal(body["name"], "Shao Chen");
			})
			.run()
			.then(resp => {
				done();
			})
			.catch(e => {
				done(e);
			});

	});

	it("Test get user", function (done) {
		// 正确测试
		fastman
			.path("/users/{userId}")
			.operation("get")
			.response("200")
			.testCase({
				name: "GetUserOK",
				save: true,
				params: [user],
			})
			.except((resp) => {
				const body = resp.json();
				assert.equal(body.name, "Shao Chen");
				assert.equal(body.id, user);
			})
			.run()
			.then(resp => {
				done();
			})
			.catch(e => {
				done(e);
			});

	});

	it("get user not found", async function () {
		try {
			// 测试未找到情况
			const resp = await fastman
				.response("404")
				.testCase({
					name: "GetUserNotFound",
					save: true,
					params: ["fdfdfder3"],
				})
				.except(resp => {
					const body = resp.json();
					assert.equal(body.name, "NotFound");
				})
				.run();

		} catch (e) {
			throw e;
		}
	});

	it("Test update user", async function () {
		try {
			const okResp = await fastman
				.path("/users/{userId}")
				.operation("put")
				.response(200)
				.testCase({
					name: "UpdateUserOK",
					save: true,
					params: [user],
					body: {
						name: "Chen Shao",
					},
				})
				.run();

			const body = okResp.json();
			assert.equal(body.name, "Chen Shao");

			// 测试一下not found
			const resp404 = await fastman
				.response(404)
				.testCase({
					name: "UpdateUserNotFound",
					save: true,
					params: ["dfdfdrt43"],
					body: {
						name: "CHen shao",
					},
				})
				.run();

			const body404 = resp404.json();
			assert.equal(body404.name, "NotFound");
		} catch (e) {
			throw e;
		}
	});

	it("Test delete user", async function () {
		const okResp = await fastman
			.path("/users/{userId}")
			.operation("delete")
			.response(204)
			.testCase({
				name: "DeleteUserOK",
				save: true,
				params: [user],
			})
			.run();

		const resp404 = await fastman
			.response(404)
			.testCase({
				name: "DeleteUserNotFound",
				save: true,
				params: ["dfdfdrt43"],
			})
			.run();
	});

});