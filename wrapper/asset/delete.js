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
		asset.delete(data.data.id);
		res
			.setHeader("Content-Type", "application/json")
			.end(JSON.stringify({ status: "ok" }));
	} catch (err) {
		console.error("Error deleting asset: " + err);
		res.statusCode = 500;
		res.end();
	}

	return true;
}