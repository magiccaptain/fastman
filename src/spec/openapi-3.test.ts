import "mocha";
import OpenApi3Spec from "./openapi-3";

const openapi3 = new OpenApi3Spec();

describe("Test OpenAPi3", function () {

    it("test set info", function () {
        openapi3.info({
            title: "测试文档",
            version: "1.0",
            description: "这是一个测试文档"
        });

        openapi3.write("./test.yaml");
    });

});