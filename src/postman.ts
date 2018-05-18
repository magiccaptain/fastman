/**
 * postman  collection format
 * https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html
 */
export declare namespace Postman {

    export interface Collection {
        info: Info,
        item: Item[],
        auth?: any,
        event?: any,
        variable?: Variable,
    }

    export interface Info {
        name: string,
        schema: string
    }

    export interface Item {
        id?: string
        name?: string
        description?: string
        variable?: Variable
        event?: any
        request: Request[] | Request
        response?: Response[]
    }

    export interface Request {
        url?: Url
        auth?: any
        proxy?: any
        certificate?: any
        method?: string
        description?: string
        header?: Header[]
        body?: RequestBody
    }

    export interface Response {
        id?: string
        originalRequest?: Request
        responseTime?: string | number // if number milliseconds
        header?: Header[] | string
        cookie?: Cookie[]
        body?: string
        status?: string
        code?: number
    }

    export interface Cookie {
        domain: string
        path: string
        expires?: string | number
        maxAge?: string
        hostOnly?: boolean
        httpOnly?: boolean
        name?: string
        secure?: boolean
        session?: boolean
        value?: string
        extensions?: any[]
    }

    export interface RequestBody {
        mode?: string
        raw?: string
        urlencoded?: UrlEncodedParameter[]
        formdata?: object
        file?: {
            src?: string
            content?: string
        }
    }

    export interface UrlEncodedParameter {
        key: string
        value?: string
        disabled?: boolean
        description: string
    }

    export interface Header {
        key: string
        value: string
        disabled?: boolean
        description?: string
    }

    export interface Url {
        raw?: string
        protocol?: string
        host: string[]
        path?: string[]
        port?: string
        query?: QueryParam[]
        hash?: string
        variable?: Variable[]
    }

    export interface QueryParam {
        key?: string
        value?: string
        disabled?: boolean
        description?: string
    }

    export interface Variable {
        id?: string
        key?: string
        value?: string
        type?: any
        name?: string
        description?: string
        system?: boolean
        disabled?: boolean
    }


}

