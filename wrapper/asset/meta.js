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
	if (req.method != "POST") return;

	switch (url.pathname) {
		case "/api_v2/asset/get": { // we're getting the metadata
			if (!req.body.data.id && !req.body.data.starter_id) {
				res.statusCode = 400;
				res.end();
				return true;
			}

			res.setHeader("Content-Type", "application/json");
			try {
				const meta = Asset.meta(req.body.data.id || req.body.data.starter_id);
				// add useless shit
				meta.share = { type: "none" };
				meta.published = "";
				res.end(JSON.stringify({
					status: "ok",
					data: meta
				}));
			} catch (err) {
				res.statusCode = 404;
				res.end("{'status':'error'}");
			}
			break;
		} case "/api_v2/asset/update/": { // we're updating it
			if (!req.body.data.id && !req.body.data.starter_id) {
				res.statusCode = 400;
				res.end();
				return true;
			}

			try {
				Asset.update(req.body.data.id || req.body.data.starter_id, req.body.data);
				res.end("{'status':'ok'}");
			} catch (err) {
				console.error("Error updating asset:", err);
				res.statusCode = 404;
				res.end("{'status':'error'}");
			}
			break;
		} default: return;
	}
	return true;
}