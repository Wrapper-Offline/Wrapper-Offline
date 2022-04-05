/***
 * asset metadata route
 */
const asset = require("./main");
const loadPost = require("../request/post_body");

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/api_v2/asset/delete/") return;
	loadPost(req, res).then(data => {
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
	});
	return true;
}