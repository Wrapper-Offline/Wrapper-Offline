/**
 * route
 * asset loading
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
	switch (req.method) {
		case "GET": {
			const match = req.url.match(/\/(assets|goapi\/getAsset)\/([^/]+)$/);
			if (!match) return;

			const aId = match[2]; // get asset id
			const b = Asset.load(aId);
			b ? (res.statusCode = 200, res.end(b)) :
				(res.statusCode = 404, res.end());
			return true;
		}

		case "POST": {
			switch (url.pathname) {
				case "/goapi/getAssetEx/":
				case "/goapi/getAsset/": {
					const aId = req.body.assetId || req.body.enc_asset_id;
					if (!aId) {
						res.statusCode = 400;
						res.end();
						return true;
					}
	
					const b = Asset.load(aId);
					if (b) {
						res.setHeader("Content-Length", b.length);
						res.end(b);
					} else {
						res.statusCode = 404;
						res.end();
					};
					return true;
				} default: return;
			}
		}
		default: return;
	}
}