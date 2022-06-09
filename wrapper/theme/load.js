/**
 * route
 * theme loading
 */
// modules
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.THEME_FOLDER);
// stuff
const fUtil = require("../fileUtil");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/getTheme/") return;
	const { themeId: tId } = req.body;
	if (!req.body.themeId) {
		res.statusCode = 400;
		res.end();
		return true;
	}

	const xmlPath = path.join(folder, `${tId}.xml`);
	try {
		const zip = await fUtil.zippy(xmlPath, "theme.xml");
		res.setHeader("Content-Type", "application/zip");
		res.end(zip);
	} catch (err) {
		console.error("Error generating theme ZIP:", err);
		res.statusCode = 500;
		res.end("1");
	}
	return true;
}