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

import {Oas20Scopes} from "./scopes.model";
import {OasSecurityScheme} from "../common/security-scheme.model";

/**
 * Models an OAS 2.0 Security Scheme object.  Example:
 *
 * {
 *   "type": "oauth2",
 *   "authorizationUrl": "http://swagger.io/api/oauth/dialog",
 *   "flow": "implicit",
 *   "scopes": {
 *     "write:pets": "modify pets in your account",
 *     "read:pets": "read your pets"
 *   }
 * }
 */
export class Oas20SecurityScheme extends OasSecurityScheme {

    public flow: string;
    public authorizationUrl: string;
    public tokenUrl: string;
    public scopes: Oas20Scopes;

    /**
     * Must construct this with a name.
     * @param name
     */
    constructor(name: string) {
        super(name);
    }

    /**
     * Creates a scopes object.
     */
    public createScopes(): Oas20Scopes {
        let rval: Oas20Scopes = new Oas20Scopes();
        rval._ownerDocument = this._ownerDocument;
        rval._parent = this;
        return rval;
    }
}
