/**
 * route
 * asset metadata
 */
// stuff
const Asset = require("./main");

/**
 * Returns an asset's metadata or updates it.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST") return;

	switch (url.path) {
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
				res.statusCode = 404;
				res.end("{'status':'error'}");
			}
			break;
		} default: return;
	}
	return true;
}