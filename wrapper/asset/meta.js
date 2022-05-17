/***
 * asset metadata route
 */
const asset = require("./main");
const loadPost = require("../request/post_body");

module.exports = async function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.path) {
		case "/api_v2/asset/get": {
				try {
					const m = asset.meta(req.body.data.id);
					// add shit that won't work for this wrap
					m.share = { type: "none" };
					m.published = "";
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({ status: "ok", data: m }));
				} catch (err) {
					res.statusCode = 404;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({ status: "invalid_asset", data: "invalid" }));
				}	
			
			break;
		}
		case "/api_v2/asset/update/": {
			loadPost(req, res).then(data => {
				const status = asset.update(data.data, data.data.id);
				if (status)
					res
						.setHeader("Content-Type", "application/json")
						.end(JSON.stringify({ status: "ok" }));
				else res.statusCode = 404, res.end();
			});
			break;
		}
		default:
			return;
	}
	return true;
}