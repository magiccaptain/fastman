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

import {IOasNodeVisitor, IOas20NodeVisitor} from "../../visitors/visitor.iface";
import {OasExtensibleNode} from "../enode.model";
import {Oas20ExternalDocumentation} from "./external-documentation.model";
import {OasTag} from "../common/tag.model";

/**
 * Models an OAS 2.0 Tag object.  Example:
 *
 * {
 *     "name": "pet",
 *     "description": "Pets operations"
 * }
 */
export class Oas20Tag extends OasTag {

    /**
     * Creates an OAS 2.0 External Documentation object.
     * @return {Oas20ExternalDocumentation}
     */
    public createExternalDocumentation(): Oas20ExternalDocumentation {
        let rval: Oas20ExternalDocumentation = new Oas20ExternalDocumentation();
        rval._ownerDocument = this.ownerDocument();
        rval._parent = this;
        return rval;
    }

    /**
     * Sets the external documentation information.
     * @param description
     * @param url
     */
    public setExternalDocumentation(description: string, url: string): Oas20ExternalDocumentation {
        let edoc: Oas20ExternalDocumentation = this.createExternalDocumentation();
        edoc.description = description;
        edoc.url = url;
        this.externalDocs = edoc;
        return edoc;
    }

}