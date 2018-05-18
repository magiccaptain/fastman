///<reference path="../../node_modules/@types/node/index.d.ts"/>
import Spec from "./base";
import {OasLibraryUtils} from "../../lib/openapi-parser/library.utils";
import {Oas30Document} from "../../lib/openapi-parser/models/3.0/document.model";
import {OasDocumentFactory} from "../../lib/openapi-parser/factories/document.factory";
import * as yaml from "js-yaml";
import {OasPathItem} from "../../lib/openapi-parser/models/common/path-item.model";
import {Oas30Response} from "../../lib/openapi-parser/models/3.0/response.model";
import {Oas30Operation} from "../../lib/openapi-parser/models/3.0/operation.model";

export namespace OpenApi3 {
    export interface ISpecificationExtension {
        // Cannot constraint to "^x-" but can filter them later to access to them
        [extensionName: string]: any;
    }

    export interface OpenAPIObject extends ISpecificationExtension {
        openapi: string;
        info: InfoObject;
        servers?: ServerObject[];
        paths: PathsObject;
        components?: ComponentsObject;
        security?: SecurityRequirementObject[];
        tags?: TagObject[];
        externalDocs?: ExternalDocumentationObject;
    }

    export interface InfoObject extends ISpecificationExtension {
        title: string;
        description?: string;
        termsOfService?: string;
        contact?: ContactObject;
        license?: LicenseObject;
        version: string;
    }

    export interface ContactObject extends ISpecificationExtension {
        name: string;
        url: string;
        email: string;
    }

    export interface LicenseObject extends ISpecificationExtension {
        name: string;
        url?: string;
    }

    export interface ServerObject extends ISpecificationExtension {
        url: string;
        description?: string;
        variables?: { [v: string]: ServerVariableObject };
    }

    export interface ServerVariableObject extends ISpecificationExtension {
        enum?: string[] | boolean[] | number[];
        default: string | boolean | number;
        description?: string;
    }

    export interface ComponentsObject extends ISpecificationExtension {
        schemas?: { [schema: string]: SchemaObject };
        responses?: { [response: string]: ResponseObject };
        parameters?: { [parameter: string]: ParameterObject };
        examples?: { [example: string]: ExampleObject };
        requestBodies?: { [request: string]: RequestBodyObject };
        headers?: { [heaer: string]: HeaderObject };
        securitySchemes?: { [securityScheme: string]: SecuritySchemeObject };
        links?: { [link: string]: LinkObject };
        callbacks?: { [callback: string]: CallbackObject };
    }

    export type Component = SchemaObject | ResponseObject | ParameterObject
        | ExampleObject | RequestBodyObject | HeaderObject | SecuritySchemeObject
        | LinkObject | CallbackObject;

    /**
     * Rename it to Paths Object to be consistent with the spec
     * See https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathsObject
     */
    export interface PathsObject extends ISpecificationExtension {
        // [path: string]: PathItemObject;
        [path: string]: PathItemObject | any;   // Hack for allowing ISpecificationExtension
    }

    export interface PathItemObject extends ISpecificationExtension {
        $ref?: string;
        summary?: string;
        description?: string;
        get?: OperationObject;
        put?: OperationObject;
        post?: OperationObject;
        delete?: OperationObject;
        options?: OperationObject;
        head?: OperationObject;
        patch?: OperationObject;
        trace?: OperationObject;
        servers?: ServerObject;
        parameters?: (ParameterObject | ReferenceObject)[];
    }

    export interface OperationObject extends ISpecificationExtension {
        tags?: string[];
        summary?: string;
        description?: string;
        externalDocs?: ExternalDocumentationObject;
        operationId?: string;
        parameters?: (ParameterObject | ReferenceObject)[];
        requestBody?: RequestBodyObject | ReferenceObject;
        responses?: ResponsesObject;
        callbacks?: CallbacksObject;
        deprecated?: boolean;
        security?: SecurityRequirementObject[];
        servers?: ServerObject;
    }

    export interface ExternalDocumentationObject extends ISpecificationExtension {
        description?: string;
        url: string;
    }

    /**
     * The location of a parameter.
     * Possible values are "query", "header", "path" or "cookie".
     * Specification:
     * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameter-locations
     */
    export type ParameterLocation = "query" | "header" | "path" | "cookie";

    /**
     * The style of a parameter.
     * Describes how the parameter value will be serialized.
     * (serialization is not implemented yet)
     * Specification:
     * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#style-values
     */
    export type ParameterStyle =
        "matrix"
        | "label"
        | "form"
        | "simple"
        | "spaceDelimited"
        | "pipeDelimited"
        | "deepObject";

    export interface ParameterObject extends ISpecificationExtension {
        name: string;
        in: ParameterLocation; // "query" | "header" | "path" | "cookie";
        description?: string;
        required?: boolean;
        deprecated?: boolean;
        allowEmptyValue?: boolean;

        style?: ParameterStyle; // "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject";
        explode?: boolean;
        allowReserved?: boolean;
        schema?: SchemaObject | ReferenceObject;
        examples?: { [param: string]: ExampleObject | ReferenceObject };
        example?: any;
        content?: ContentObject;
    }

    export interface RequestBodyObject extends ISpecificationExtension {
        description?: string;
        content: ContentObject;
        required?: boolean;
    }

    export interface ContentObject {
        [mediatype: string]: MediaTypeObject;
    }

    export interface MediaTypeObject extends ISpecificationExtension {
        schema?: SchemaObject | ReferenceObject;
        examples?: ExampleObject;
        example?: ExampleObject | ReferenceObject;
        encoding?: EncodingObject;
    }

    export interface EncodingObject extends ISpecificationExtension {
        // [property: string]: EncodingPropertyObject;
        [property: string]: EncodingPropertyObject | any;   // Hack for allowing ISpecificationExtension
    }

    export interface EncodingPropertyObject {
        contentType?: string;
        headers?: { [key: string]: HeaderObject | ReferenceObject };
        style?: string;
        explode?: boolean;
        allowReserved?: boolean;

        [key: string]: any;   // (any) = Hack for allowing ISpecificationExtension
    }

    export interface ResponsesObject extends ISpecificationExtension {
        default?: ResponseObject | ReferenceObject;

        // [statuscode: string]: ResponseObject | ReferenceObject;
        [statuscode: string]: ResponseObject | ReferenceObject | any;   // (any) = Hack for allowing ISpecificationExtension
    }

    export interface ResponseObject extends ISpecificationExtension {
        description: string;
        headers?: HeadersObject;
        content?: ContentObject;
        links?: LinksObject;
    }

    export interface CallbacksObject extends ISpecificationExtension {
        // [name: string]: CallbackObject | ReferenceObject;
        [name: string]: CallbackObject | ReferenceObject | any;   // Hack for allowing ISpecificationExtension
    }

    export interface CallbackObject extends ISpecificationExtension {
        // [name: string]: PathItemObject;
        [name: string]: PathItemObject | any;   // Hack for allowing ISpecificationExtension
    }

    export interface HeadersObject {
        [name: string]: HeaderObject | ReferenceObject;
    }

    export interface ExampleObject {
        summary?: string;
        description?: string;
        value?: any;
        externalValue?: string;

        [property: string]: any; // Hack for allowing ISpecificationExtension
    }

    export interface LinksObject {
        [name: string]: LinkObject | ReferenceObject;
    }

    export interface LinkObject extends ISpecificationExtension {
        operationRef?: string;
        operationId?: string;
        parameters?: LinkParametersObject;
        requestBody?: any | string;
        description?: string;
        server?: ServerObject;

        [property: string]: any; // Hack for allowing ISpecificationExtension
    }

    export interface LinkParametersObject {
        [name: string]: any | string;
    }

    export interface HeaderObject extends ParameterObject {
    }

    export interface TagObject extends ISpecificationExtension {
        name: string;
        description?: string;
        externalDocs?: ExternalDocumentationObject;

        [extension: string]: any; // Hack for allowing ISpecificationExtension
    }

    export interface ExamplesObject {
        [name: string]: any;
    }

    export interface ReferenceObject {
        $ref: string;
    }

    export interface SchemaObject extends ISpecificationExtension {
        nullable?: boolean;
        discriminator?: DiscriminatorObject;
        readOnly?: boolean;
        writeOnly?: boolean;
        xml?: XmlObject;
        externalDocs?: ExternalDocumentationObject;
        example?: any;
        examples?: any[];
        deprecated?: boolean;

        type?: string;
        allOf?: (SchemaObject | ReferenceObject)[];
        oneOf?: (SchemaObject | ReferenceObject)[];
        anyOf?: (SchemaObject | ReferenceObject)[];
        not?: SchemaObject | ReferenceObject;
        items?: SchemaObject | ReferenceObject;
        properties?: { [propertyName: string]: (SchemaObject | ReferenceObject) };
        additionalProperties?: (SchemaObject | ReferenceObject);
        description?: string;
        format?: string;
        default?: any;

        title?: string;
        multipleOf?: number;
        maximum?: number;
        exclusiveMaximum?: boolean;
        minimum?: number;
        exclusiveMinimum?: boolean;
        maxLength?: number;
        minLength?: number;
        pattern?: string;
        maxItems?: number;
        minItems?: number;
        uniqueItems?: boolean;
        maxProperties?: number;
        minProperties?: number;
        required?: string[];
        enum?: any[];
    }

    export interface SchemasObject {
        [schema: string]: SchemaObject;
    }

    export interface DiscriminatorObject {
        propertyName: string;
        mapping?: { [key: string]: string };
    }

    export interface XmlObject extends ISpecificationExtension {
        name?: string;
        namespace?: string;
        prefix?: string;
        attribute?: boolean;
        wrapped?: boolean;
    }

    export type SecuritySchemeType =
        "apiKey"
        | "http"
        | "oauth2"
        | "openIdConnect";

    export interface SecuritySchemeObject extends ISpecificationExtension {
        type: SecuritySchemeType;
        description?: string;
        name?: string;              // required only for apiKey
        in?: string;                // required only for apiKey
        scheme?: string;            // required only for http
        bearerFormat?: string;
        flow?: OAuthFlowObject;     // required only for oauth2
        openIdConnectUrl?: string;  // required only for oauth2
    }

    export interface OAuthFlowsObject extends ISpecificationExtension {
        implicit?: OAuthFlowObject;
        password?: OAuthFlowObject;
        clientCredentials?: OAuthFlowObject;
        authorizationCode?: OAuthFlowObject;
    }

    export interface OAuthFlowObject extends ISpecificationExtension {
        authorizationUrl: string;
        tokenUrl: string;
        refreshUrl?: string;
        scopes: ScopesObject;
    }

    export interface ScopesObject extends ISpecificationExtension {
        [scope: string]: any; // Hack for allowing ISpecificationExtension
    }

    export interface SecurityRequirementObject {
        [name: string]: string[];
    }

}


export default class OpenApi3Spec extends Spec {
    private oasUtils: OasLibraryUtils = new OasLibraryUtils();
    private openapiDoc: Oas30Document;

    tag(tag: OpenApi3.TagObject) {
        const tagNode = this.openapiDoc.createTag();
        tagNode.name = tag.name;
        tagNode.description = tag.description;

        const tags = this.openapiDoc.tags || [];
        tags.push(tagNode);
        this.openapiDoc.tags = tags;
    }


    info(info: OpenApi3.InfoObject) {
        if (!this.openapiDoc) {
            this.openapiDoc = <Oas30Document> new OasDocumentFactory().createEmpty("3.0");
        }
        const oasInfo = this.openapiDoc.createInfo();
        this.oasUtils.readNode(info, oasInfo);
        this.openapiDoc.info = oasInfo;
    }

    load(spec: string | object) {
        const factory = new OasDocumentFactory();
        if (typeof spec === "string") {
            this.openapiDoc = <Oas30Document> factory.createFromJson(spec);
        } else {
            this.openapiDoc = <Oas30Document> factory.createFromObject(spec);
        }
        return this;
    }

    write(format: string = "yaml"): string {
        let json = this.oasUtils.writeNode(this.openapiDoc);
        return format === "yaml" ? yaml.safeDump(json) : JSON.stringify(json, null, 2);
    }

    server(server?: OpenApi3.ServerObject): OpenApi3.ServerObject[] {
        if (server) {
            this.openapiDoc.addServer(server.url, server.description);
        }
        return this.openapiDoc.servers.map(s => {
            return this.oasUtils.writeNode(s);
        });
    }

    /**
     * 添加或查找一个资源
     * @param {string} path
     * @returns {OasPathItem}
     */
    path(path: string): OpenApi3.PathItemObject {
        let paths = this.openapiDoc.paths || this.openapiDoc.createPaths();
        let pathItem = paths.getItem(path) || paths.createPathItem(path);
        paths.addItem(path, pathItem);
        this.openapiDoc.paths = paths;
        return this.oasUtils.writeNode(pathItem);
    }

    operation(path: string, method: string, operation?: OpenApi3.OperationObject): OpenApi3.OperationObject {
        const paths = this.openapiDoc.paths;
        let pathNode = paths.getItem(path);
        let operationNode = pathNode[method] || pathNode.createOperation(method);
        if (operation) {
            this.oasUtils.readNode(operation, operationNode);
        }
        pathNode[method] = operationNode;
        return this.oasUtils.writeNode(operationNode);
    }

    response(status: string, path: string, method: string, response?: OpenApi3.ResponseObject): OpenApi3.ResponseObject {
        const paths = this.openapiDoc.paths;
        let pathNode = paths.getItem(path);
        let operationNode = pathNode[method] || pathNode.createOperation(method);
        let responsesNode = operationNode.responses || operationNode.createResponses();
        const responseNode = <Oas30Response>(responsesNode.getItem(status) || responsesNode.createResponse(status));
        if (response) {
            this.oasUtils.readNode(response, responseNode);
        }
        responsesNode.addItem(status, responseNode);
        operationNode.responses = responsesNode;
        pathNode[method] = operationNode;
        return this.oasUtils.writeNode(responseNode);
    }


    component(name: string,
              value: OpenApi3.Component,
              type?: string): any {
        const componentType = type || "schemas";
        const components = this.openapiDoc.components || this.openapiDoc.createComponents();
        let component;
        // TODO component的类型需要补充完整
        switch (componentType) {
            case "schemas": {
                component = components.getSchemaDefinition(name) ||
                    components.createSchemaDefinition(name);
                this.oasUtils.readNode(value, component);
                components.addSchemaDefinition(name, component);
                break;
            }
            case "parameters": {
                component = components.getParameterDefinition(name) ||
                    components.createParameterDefinition(name);
                this.oasUtils.readNode(value, component);
                components.addParameterDefinition(name, component);
                break;
            }
            case "responses": {
                component = components.getResponseDefinition(name) ||
                    components.createResponseDefinition(name);
                this.oasUtils.readNode(value, component);
                components.addResponseDefinition(name, component);
                break;
            }
        }
        this.openapiDoc.components = components;
        return value;
    }

    // TODO set version
    version(version?: string): number {
        return 3;
    }

    example(name: string, example: OpenApi3.ExampleObject, path: string, method: string, status: string, mediaType: string = "application/json") {
        const paths = this.openapiDoc.paths;
        let pathNode = paths.getItem(path);
        let operationNode = pathNode[method] || pathNode.createOperation(method);
        let responsesNode = operationNode.responses || operationNode.createResponses();
        const responseNode = <Oas30Response>(responsesNode.getItem(status) || responsesNode.createResponse(status));

        const mediaTypeNode = responseNode.getMediaType(mediaType) || responseNode.createMediaType(mediaType);
        const exampleNode = mediaTypeNode.getExample(name) || mediaTypeNode.createExample(name);
        this.oasUtils.readNode(example, exampleNode);
        mediaTypeNode.addExample(exampleNode);
        responseNode.addMediaType(mediaType, mediaTypeNode);
        responsesNode.addResponse(status, responseNode);
        operationNode.responses = responsesNode;
        pathNode[method] = operationNode;
        return this.oasUtils.writeNode(exampleNode);
    }

    requestExample(name: string, example: OpenApi3.ExampleObject, path: string, method: string, mediaType: string = "application/json") {
        const paths = this.openapiDoc.paths;
        let pathNode = paths.getItem(path);
        let operationNode = <Oas30Operation> (pathNode[method] || pathNode.createOperation(method));
        pathNode[method] = operationNode;

        if (operationNode.requestBody) {
            let mediaTypeNode = operationNode.requestBody.getMediaType(mediaType)
                || operationNode.requestBody.createMediaType(mediaType);
            const exampleNode = mediaTypeNode.createExample(name);
            this.oasUtils.readNode(example, exampleNode);
            mediaTypeNode.addExample(exampleNode);
            operationNode.requestBody.addMediaType(mediaType, mediaTypeNode);
            return this.oasUtils.writeNode(exampleNode);
        }
    }

}