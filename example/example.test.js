const Fastman = require("../dist/index").default;

const fastman = new Fastman();
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const assert = require("assert");

const specPath = path.join(__dirname, "example.yaml");
const testedSpecPath = path.join(__dirname, "example_tested.yaml");
const postmanPath = path.join(__dirname, "postman.json");
let user = null;

describe("Fastman example", function () {

    before(function () {

        // 读取 yaml 文件到object中， 也可以直接读取json文件
        const spec = yaml.safeLoad(fs.readFileSync(specPath).toString("utf8"));

        fastman
            .openApiVersion(3)      //指定openapi版本，目前只支持3.0 必须
            .load(spec)             // 读取spec, 文档中应包含Server的描述, 或者通过 server方法添加
            // .server({            // 添加server
            //     url: "http://localhost:3000",
            //     description: "测试文档",
            // })
            .globalHeaders({        // 配置全局测试使用的header, 可按照方法配置，也可设置 all: {} 为所有方法公用
                all: {
                    "Authorization": "Bearer 345453434gfdfgdfdf",
                },
                post: {
                    "Content-Type": "application/json",
                },
                put: {
                    "Content-Type": "application/json",
                },
            })
            .resource("Users");     // 绑定资源，设置之后未来的测试都在Users资源下
    });

    after(function () {
        // 输出测试结果

        // 写入openapi文档到文件
        fs.writeFileSync(testedSpecPath, fastman.writeSpec());

        // 写入测试用例到
        fastman.exportPostman(postmanPath);

    });

    it("Test List User", async function () {
        await fastman
            .path("/users")         // 选择当前测试的路径
            .operation("get")       // 选择当前测试的方法
            .response("200")        // 选择当前测试的status code，fastman会自动assert结果中的 stauts code
            .testCase({             // 只有在resource， path, operation ,response 都正确配置之后，才可以配置测试用例
                name: "ListUserOK", // 测试用例的名称，fastman会将这一名称写入openapi文档和postman文件中
                save: true,         // 结果是否保存，测试结果是否保存在openapi文档的example中
                query: {            // 配置request query
                    offset: 0,
                    limit: 10,
                },
            })
            .except((resp) => {     // 添加一些测试代码
                let body = resp.json();      // resp 是newman 自动返回的Response类型，没有找到相关文档
                                             // resp.json() json方式获取body 注意！如果Response没有body， 这里会抛出一个异常
                assert(body.length === 10);
                const xTotal = resp.headers.get("X-Total"); // resp.headers.get(key) // 获取headers
                assert(xTotal !== 0);
            })
            .run()                  // run 返回的是一个 Promise<Response>
    });

    it('Test Create User ', async function () {
        let resp = await fastman
            .path("/users")
            .operation("post")
            .response("200")
            .testCase({
                name: "CreateUerOK",
                save: true,
                body: {
                    name: "MagicCaptain",
                },
            }).run();

        // 测试代码也可以放在后面写
        const body = resp.json();
        assert(body.id);
        user = body.id;
        assert(body["name"] === "MagicCaptain");
    });

    it("Test get User", async function () {
        let resp = await fastman
            .path("/users/{userId}")
            .operation("get")
            .response("200")
            .testCase({
                name: "GetUserOK",
                save: true,
                params: [user],
            }).run();

        let body = resp.json();
        assert(body.name === "MagicCaptain");
        assert(body.id === user);

        // 连续测试同一个 path，operation，response时不需要重新配置
        resp = await fastman
            .response("404")
            .testCase({
                name: "GetUserNotFound",
                save: true,
                params: ["fdfdfder3"],
            })
            .run();

        body = resp.json();
        assert(body.name === "NotFound");

    });

    it("Test update user", async function () {
        const okResp = await fastman
            .path("/users/{userId}")
            .operation("put")
            .response(200)
            .testCase({
                name: "UpdateUserOK",
                save: true,
                params: [user],
                body: {
                    name: "CaptainMagic",
                },
            })
            .run();

        const body = okResp.json();
        assert(body.name === "CaptainMagic");

        // 测试一下not found
        const resp404 = await fastman
            .response(404)
            .testCase({
                name: "UpdateUserNotFound",
                save: true,
                params: ["dfdfdrt43"],
                body: {
                    name: "CaptainMagic",
                },
            })
            .run();

        const body404 = resp404.json();
        assert(body404.name === "NotFound");
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

        const body404 = resp404.json();
        assert(body404.name === "NotFound");
    });


});