const env = Object.assign(process.env, require("../env"), require("../config"));
// modules
const assert = require("node:assert");
const base64 = require("js-base64");
const fs = require("fs");
const path = require("path");
const request = require("supertest");
const xmldoc = require("xmldoc");
// stuff
const server = require("../server")();

let id;

describe("Character", () => {
	it("/goapi/saveCCCharacter/", (done) => {
		const body = fs.readFileSync(
			path.join(__dirname, "./defaults/character.xml")
		);
		const thumbdata = base64.encode(fs.readFileSync(
			path.join(__dirname, "./defaults/character.png")
		));

		request(server.server)
			.post("/goapi/saveCCCharacter/")
			.send({
				body,
				thumbdata,
				themeId: "family",
			})
			.end((e, res) => {
				if (e) {
					done(e);
				}

				const resCode = res.text.charAt(0);
				id = res.text.substring(1);

				// check if the response was ok
				if (resCode == "1") {
					done(new Error(id));
				}

				done();
			});
	});
});

describe("Asset", () => {
	it("/api_v2/asset/get", (done) => {
		request(server.server)
			.post("/api_v2/asset/get")
			.send({
				data: { id }
			})
			.end((e, res) => {
				if (e) {
					done(e);
				}

				const info = JSON.parse(res.text);

				if (info.status != "ok") {
					done(new Error(info.data));
				}

				done();
			});
	});
	it("/goapi/getUserAssetsXml/", (done) => {
		request(server.server)
			.post("/goapi/getUserAssetsXml/")
			.send({
				type: "char",
				subtype: 0,
				themeId: "family"
			})
			.end((e, res) => {
				if (e) {
					done(e);
				}

				const list = new xmldoc.XmlDocument(res.text);

				if (list.childWithAttribute("id", id)) {
					done();
				} else {
					done(new Error("it's not listed"));
				}
			});
	});
});

