import newman  = require("newman");
import fs = require("fs");
import path = require("path");

const collectionFile = path.join(__dirname, "../../", "./sample-collection.json");


describe("Test new man", function () {

  it("should ok", function () {
    const json = fs.readFileSync(collectionFile).toString("utf8");
    const collection = JSON.parse(json);

    newman.run({
      collection: collection,
      reporters: ["json", "cli"],
    }, function (err, summary) {

      if (err) {
        console.log(err);
      }


      // 取body
      console.log(summary.run.executions[0].response.json());
      // 取headers
      console.log(summary.run.executions[0].response.headers.members);
      // 取 cookies
      console.log(summary.run.executions[0].response.cookies);

    });

  });


});
