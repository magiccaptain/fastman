/**
 * @license
 * Copyright 2017 Red Hat
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Oas20Response} from "./response.model";
import {IOasIndexedNode} from "../inode.model";
import {OasResponses} from "../common/responses.model";

/**
 * Models an OAS 2.0 Responses object.  The Responses object can have any number of child
 * responses, where the field names are either 'default' or an HTTP status code.  Example:
 *
 * {
 *   "200": {
 *     "description": "a pet to be returned",
 *     "schema": {
 *       "$ref": "#/definitions/Pet"
 *     }
 *   },
 *   "default": {
 *     "description": "Unexpected error",
 *     "schema": {
 *       "$ref": "#/definitions/ErrorModel"
 *     }
 *   }
 * }
 */
export class Oas20Responses extends OasResponses {

    /**
     * Creates an OAS 2.0 response object.
     * @param statusCode
     * @return {Oas20Response}
     */
    public createResponse(statusCode?: string): Oas20Response {
        let rval: Oas20Response = new Oas20Response(statusCode);
        rval._ownerDocument = this._ownerDocument;
        rval._parent = this;
        return rval;
    }

}
