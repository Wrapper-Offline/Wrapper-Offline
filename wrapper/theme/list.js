/**
 * route
 * theme listing
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
	if (req.method != "POST" || url.pathname != "/goapi/getThemeList/") return;

	const xmlPath = path.join(folder, "themelist.xml");
	try {
		const zip = await fUtil.zippy(xmlPath, "themelist.xml");
		res.setHeader("Content-Type", "application/zip");
		res.end(zip);
	} catch (err) {
		if (process.env.NODE_ENV == "dev") throw err;
		console.error("Error generating themelist ZIP:", err);
		res.statusCode = 500;
		res.end("1");
	}
	return true;
}