/**
 * newman runner
 */

import {TestCase} from "../fastman";
import {Postman} from "../postman";
import Collection = Postman.Collection;
import Item = Postman.Item;
import newman  = require("newman");

import {Promise} from "es6-promise";

export default class NewmanRunner {
    /**
     * 跑测试
     */
    run(testCase: TestCase, collectionName?: string) {
        return new Promise<object>((resolve, reject) => {
            const item: Item = {
                name: testCase.name,
                request: testCase.request
            };

            const collection: Collection = {
                info: {
                    name: collectionName || "TestCollection",
                    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
                },
                item: [item]
            };

            newman.run(
                {
                    collection,
                    reporters: ["json", "cli"]
                },
                function (err, summary) {
                    if (err) {
                        reject(err);
                    }
                    resolve(summary.run.executions[0].response);
                });
        });
    }


}


