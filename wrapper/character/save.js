/**
 * route
 * character saving
 */
// stuff
const { meta } = require("../asset/main");
const Char = require("./main");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST") return;

	switch (url.pathname) {
		case "/goapi/saveCCCharacter/": { // save all
			// check for missing data
			if (!req.body.body || !req.body.thumbdata || !req.body.themeId) {
				res.statusCode = 400;
				res.end();
				return true;
			}
			const body = Buffer.from(req.body.body);
			const thumb = Buffer.from(req.body.thumbdata, "base64");

			const meta = {
				type: "char",
				subtype: 0,
				title: "Untitled",
				themeId: req.body.themeId
			};
			try {
				const id = Char.save(body, meta);
				Char.saveThumb(id, thumb)
				res.end("0" + id);
			} catch (err) {
				console.error("Error saving character:", err);
				res.statusCode = 500;
				res.end("1");
			}
			return true;
		} case "/goapi/saveCCThumbs/": { // save thumbs
			if (!req.body.thumbdata || !req.body.assetId) {
				res.statusCode = 400;
				res.end();
				return true;
			}
			const cId = req.body.assetId;
			const thumb = Buffer.from(req.body.thumbdata, "base64");

			try {
				meta(cId);
				Char.saveThumb(cId, thumb)
				res.end("0" + cId);
			} catch (err) {
				console.error("Error saving character thumb:", cId, err);
				res.statusCode = 500;
				res.end("1");
			}
			return true;
		} default: return;
	}
}