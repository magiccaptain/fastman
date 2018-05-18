abstract class Spec {

    /**
     * 获取文档的version
     * @param {string} version
     * @returns {number}
     */
    abstract version(version?: string): number

    /**
     * 配置文档描述
     * @param info
     */
    abstract info(info: any)

    /**
     * 从openapi对象中载入
     * @param {object} spec
     */
    abstract load(spec: string | object);

    /**
     * 保存到文件
     * @param format
     */
    abstract write(format: string): string;

    /**
     * 配置服务器
     */
    abstract server(server?: any): any;

    abstract path(path: string): any;

    /**
     * 在path下添加或者获取一个操作
     * @param path
     * @param {string} method
     * @param operation
     * @returns {any}
     */
    abstract operation(path: string, method: string, operation?: any): any;

    /**
     * 在 path method 下添加或获取一个response
     * @param status 返回的状态
     * @param {string} path
     * @param {string} method
     * @param response
     * @returns {any}
     */
    abstract response(status: string, path: string, method: string, response?: any): any;

    /**
     * 定义 component
     * @param {string} type 可以为 schemas, parameters, responses 等 默认为schemas
     * @param {string} name
     * @param value
     * @returns {any}
     */
    abstract component(name: string, value: any, type?: string): any;

    /**
     * 写入example
     * @param {string} name
     * @param example
     * @param {string} path
     * @param {string} method
     * @param {string} status
     * @param mediaType
     */
    abstract example(name: string, example: any, path: string, method: string, status: string, mediaType?: string)

    /**
     * 添加request的example
     * @param {string} name
     * @param example
     * @param {string} path
     * @param {string} method
     * @param mediaType
     */
    abstract requestExample(name: string, example: any, path: string, method: string, mediaType?: string)

}

export default Spec;