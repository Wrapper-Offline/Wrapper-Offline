/**
 * route
 * asset metadata
 */
const asset = require("./main");

module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/api_v2/asset/delete/") return;
	else if (!req.body.data.id) {
		res.statusCode = 400;
		res.end();
		return true;
	}

	try {
		asset.delete(req.body.data.id);
		res.setHeader("Content-Type", "application/json");
		res.end("{'status':'ok'}");
	} catch (err) {
		console.error("Error deleting asset:", err);
		res.statusCode = 500;
		res.end("{'status':'error'}");
	}

	return true;
}