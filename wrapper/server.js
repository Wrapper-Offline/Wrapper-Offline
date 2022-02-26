/***
 * start wrapper: offline"s server
 */
// assign config and env.json stuff to process.env
const env = Object.assign(process.env, require("./env"), require("./config"));
const http = require("http");
const url = require("url");

/**
 * routes
 */
const asu = require("./asset/upload");
const asl = require("./asset/load");
const asL = require("./asset/list");
const ast = require("./asset/thmb");
const chr = require("./character/redirect");
const pmc = require("./character/premade");
const chl = require("./character/load");
const chs = require("./character/save");
const chu = require("./character/upload");
const stl = require("./static/load");
const stp = require("./static/page");
const mvl = require("./movie/load");
const mvL = require("./movie/list");
const mvm = require("./movie/meta");
const mvs = require("./movie/save");
const mvt = require("./movie/thmb");
const mvu = require("./movie/upload");
const thl = require("./theme/load");
const thL = require("./theme/list");
const tsv = require("./tts/voices");
const tsl = require("./tts/load");

const functions = [
	asu,
	asl,
	asL,
	ast,
	chr,
	pmc,
	chl,
	chs,
	chu,
	stl,
	stp,
	mvl,
	mvL,
	mvm,
	mvs,
	mvt,
	mvu,
	thl,
	thL,
	tsv,
	tsl,
];

/**
 * create the server
 */
module.exports = http
	.createServer((req, res) => {
		try {
			const parsedUrl = url.parse(req.url, true);
			// run each route function until the correct one is found
			const found = functions.find((f) => f(req, res, parsedUrl));
			// log every request
			console.log(req.method, parsedUrl.path);
			if (!found) { // page not found
				res.statusCode = 404;
				res.end();
			}
		} catch (x) {
			res.statusCode = 404;
			res.end();
		}
	})
	.listen(env.PORT || env.SERVER_PORT, console.log("Wrapper: Offline has started."))

// 1 year of 1.3.0 development
// thanks xom
