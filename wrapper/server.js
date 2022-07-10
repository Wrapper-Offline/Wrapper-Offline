/**
 * start wrapper: offline's server
 */
// modules
const http = require("http");
const url = require("url");
const formidable = require("formidable");
const static = require("node-static");

/**
 * routes
 */
// this is stupid
const asd = require("./asset/delete");
const asa = require("./asset/save");
const asl = require("./asset/load");
const asL = require("./asset/list");
const asm = require("./asset/meta");
const ast = require("./asset/thmb");
const chr = require("./character/redirect");
const pmc = require("./character/premade");
const chl = require("./character/load");
const chs = require("./character/save");
const chu = require("./character/upload");
const sts = require("./starter/save");
const Stl = require("./static/load");
const Stp = require("./static/page");
const mvd = require("./movie/delete");
const mvl = require("./movie/load");
const mvL = require("./movie/list");
const mvm = require("./movie/meta");
const mvr = require("./movie/redirect");
const mvR = require("./movie/repair")
const mvs = require("./movie/save");
const mvt = require("./movie/thmb");
const thl = require("./theme/load");
const thL = require("./theme/list");
const tsv = require("./tts/voices");
const tsl = require("./tts/load");
const wal = require("./waveform/load");
const was = require("./waveform/save");
const functions = [
	asd,
	asa,
	asl,
	asL,
	asm,
	ast,
	chr,
	pmc,
	chl,
	chs,
	chu,
	sts,
	Stl,
	Stp,
	mvd,
	mvl,
	mvL,
	mvm,
	mvr,
	mvR,
	mvs,
	mvt,
	thl,
	thL,
	tsv,
	tsl,
	wal,
	was
];

/**
 * create the server
 */
module.exports = function () {
	const file = new static.Server("../server", { cache: 2 });
	http
		.createServer(async (req, res) => {
			try {
				const parsedUrl = url.parse(req.url, true);
				// parse post requests
				if (req.method == "POST") {
					await new Promise((resolve, reject) =>
						new formidable.IncomingForm().parse(req, async (e, f, files) => {
							req.body = f;
							req.files = files;
							resolve();
						}
					));
				}
				// run each route function until the correct one is found
				let found = false;
				for (let i = 0; i < functions.length; i++) {
					const result = await functions[i](req, res, parsedUrl);
					if (result) {
						found = true;
						break;
					}
				}
				if (!found) { // page not found
					req.addListener("end", () =>
						file.serve(req, res)
					).resume();
					// don't log static files
					return;
				}
				// log every request
				console.log(req.method, parsedUrl.path);
			} catch (x) {
				console.error(x);
				res.statusCode = 404;
				res.end();
			}
		})
		.listen(process.env.SERVER_PORT, console.log("Wrapper: Offline has started."));
};

// 1 year of 1.3.0 development
// thanks xom
