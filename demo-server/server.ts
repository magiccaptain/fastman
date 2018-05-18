import express = require("express");
import http = require("http");
import bodyParser = require("body-parser");
import Mock  = require("mockjs");
import fs = require("fs");
import path = require("path");
import yaml = require("js-yaml");
import httpStatus from "@southfarm/http-status";
import _ = require("lodash");

const PORT = 3000;
const app = express();

let {users} = Mock.mock({
	"users|100": [{
		"id": "@id",
		"name": "@name",
	}],
});
app.use(bodyParser.json({limit: "100kb"}));

app.get("/doc.json", function (req, res) {
	const docPath = path.join(__dirname, "..", "example", "example.yaml");
	const json = yaml.safeLoad(fs.readFileSync(docPath).toString("utf8"));
	res.send(JSON.stringify(json, null, 4));
});

app.get("/doc", function (req, res) {
	const docPath = path.join(__dirname, "doc.html");
	res.send(fs.readFileSync(docPath).toString("utf8"));
});

app.get("/tested_doc.json", function (req, res) {
	const docPath = path.join(__dirname, "..", "example", "example_tested.yaml");
	const json = yaml.safeLoad(fs.readFileSync(docPath).toString("utf8"));
	res.send(JSON.stringify(json, null, 4));
});

app.get("/doc/tested", function (req, res) {
	const docPath = path.join(__dirname, "doc_tested.html");
	res.send(fs.readFileSync(docPath).toString("utf8"));
});

app.get("/", function (req, res) {
	res.send("hello world");
});

// list
app.get("/api/users", function (req, res) {
	const {limit, offset} = req.query;

	let respUsers = users;
	if (offset) {
		respUsers = users.slice(offset);
	}

	if (limit) {
		respUsers = users.slice(0, limit);
	}

	res.set("X-Total", users.length);
	return res.json(respUsers);
});

// create
app.post("/api/users", function (req, res) {
	const {body} = req;
	const {id} = Mock.mock({
		"id": "@id",
	});
	body.id = id;
	users.push(body);
	return res.json(body);
});

// get by id
app.get("/api/users/:id", function (req, res) {
	const {id} = req.params;
	const found = users.find(u => u.id === id);

	if (found) {
		return res.json(found);
	} else {
		const err = new httpStatus.NotFound("User not found");
		delete err.stack;
		return res.status(err.statusCode).json(err);
	}
});

// update
app.put("/api/users/:id", function (req, res) {
	const {id} = req.params;
	const found = _.findIndex(users, u => u["id"] === id);

	if (found !== -1) {
		const {body} = req;
		users[found]["name"] = body.name;
		return res.json(users[found]);
	} else {
		const err = new httpStatus.NotFound("User not found");
		delete err.stack;
		return res.status(err.statusCode).json(err);
	}
});

app.delete("/api/users/:id", function (req, res) {
	const {id} = req.params;
	const found = _.findIndex(users, u => u["id"] === id);

	if (found !== -1) {
		_.remove(users, u => u["id"] === id);
		return res.status(204).send();
	} else {
		const err = new httpStatus.NotFound("User not found");
		delete err.stack;
		return res.status(err.statusCode).json(err);
	}

});

const server = http.createServer(app);
server.listen(PORT);

console.log("Start demo server on port " + PORT);





