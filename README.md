# Fastman

fastman 是一个restful api 测试的辅助库，可以快速建立api测试，并完成openapi的文档编写;
并将测试用例导出为postman的格式文件，以便共享测试用例。

目前只支持 OpenApi 3.0 版本的文档格式

测试的runner使用 newman

## Use

### Install

For yarn

```
yarn add fastman
```

For npm
```
npm i fastman --save
```

## Demo

Clone 仓库


```
yarn

yarn test

yarn demo-server
```

测试前文档

[http://localhost:3000/doc](http://localhost:3000/doc)

测试后文档

[http://localhost:3000/doc/tested](http://localhost:3000/doc/tested)

### 编写API文档

编写需要测试的openapi文档，如 [example.yaml](example/example.yaml)

### 新建一个测试文件

[example.test.js](example/example.test.js)

引入并初始化fastman

```js
const Fastman = require("fastman").default;

const fastman = new Fastman();
```

可以使用任何测试框架，本例使用mocha

测试前需要做一些准备工作

```js
    before(function () {

        // 读取 yaml 文件到object中， 也可以直接读取json文件
        const spec = yaml.safeLoad(fs.readFileSync(specPath).toString("utf8"));

        fastman
            .openApiVersion(3)      //指定openapi版本，目前只支持3.0 必须
            .load(spec)             // 读取spec
            .globalHeaders({        // 配置全局测试使用的header, 可按照方法配置，也可设置 all: {} 为所有方法公用
                post: {
                    "Content-Type": "application/json",
                },
                put: {
                    "Content-Type": "application/json",
                },
            })
            .resource("Users");     // 绑定资源，设置之后未来的测试都在Users资源下
    });
```

### 写测试code

```js
    it("Test Create User", async function () {
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
```

### 另一种写法

```js
    it('Test Create User ', async function () {
        let resp = await fastman
            .path("/users")
            .operation("post")
            .response("200")
            .testCase({
                name: "CreateUerOK",
                save: true,
                body: {
                    name: "Shao Chen",
                },
            }).run();

        // 测试代码也可以放在后面写
        const body = resp.json();
        assert.exists(body.id);
        user = body.id;
        assert(body["name"] === "Shao Chen");
    });
```
### 同一api的多个TestCase测试

```js
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

    })
```

### 输出测试结果

```js
    after(function () {
        // 输出测试结果

        // 写入openapi文档到文件, 设置save：true 的测试用例会自动将测试结果写入example中
        fs.writeFileSync(testedSpecPath, fastman.writeSpec());

        // 写入测试用例到postman 文件中, 可直接在postman 中导出
        // 如果给出的file不存在，则会新建一个collection文件
        // 如果file存在，则会在collection中按照 resource 分文件夹存放测试用例

        fastman.exportPostman(postmanPath);

    });
```

### 测试用例配置

```ts
export interface TestCase {
    // 测试用例名
	name: string,
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
```



## Roadmap

  - [x] ~~OpenApi 3.0 support~~
  - [x] ~~newman test runner~~
  - [x] ~~export to postman collection file~~
  - [ ] Autogen restful api doc template
  - [ ] Swagger 2.0 support














