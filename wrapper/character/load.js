/**
 * route
 * character loading
 */
// vars
const base = Buffer.alloc(1, "0");
// stuff
const Char = require("./main");
const { xmlFail } = require("../request/extend");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	let cId;
	switch (req.method) {
		case "GET": {
			const match = req.url.match(/\/characters\/([^.]+)(?:\.xml)?$/);
			if (!match) return;
			cId = match[1];

			break;
		} case "POST": {
			if (url.pathname != "/goapi/getCcCharCompositionXml/") return;
			cId = req.body.assetId || req.body.original_asset_id;

			break;
		} default: return;
	}

	console.log("Loading character: " + cId);
	try {
		const buf = await Char.load(cId);
		res.setHeader("Content-Type", "text/html; charset=UTF-8");
		res.end(Buffer.concat([base, buf]));
	} catch (err) {
		console.log("But nobody came.")
		res.statusCode = 404;
		res.end("1" + xmlFail("Character not found."));
	}
}