/**
 * route
 * asset metadata
 */
// stuff
const Asset = require("./main");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/api_v2/asset/delete/") return;
	else if (!req.body.data.id) {
		res.statusCode = 400;
		res.end();
		return true;
	}

	try {
		Asset.delete(req.body.data.id);
		res.setHeader("Content-Type", "application/json");
		res.end("{'status':'ok'}");
	} catch (err) {
		console.error("Error deleting asset:", err);
		res.statusCode = 500;
		res.end("{'status':'error'}");
	}

	return true;
}