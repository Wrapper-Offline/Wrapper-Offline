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
 * Zips a theme XML.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/getTheme/") return;
	else if (!req.body.themeId) {
		res.statusCode = 400;
		res.end();
		return true;
	}
	let theme = req.body.themeId;
	if (theme == "family") theme = "custom";

	const xmlPath = path.join(folder, `${theme}.xml`);
	try {
		const zip = await fUtil.zippy(xmlPath, "theme.xml");
		res.setHeader("Content-Type", "application/zip");
		res.end(zip);
	} catch (err) {
		if (process.env.NODE_ENV == "dev") throw err;
		console.error("Error generating theme ZIP: " + err);
		res.statusCode = 500;
		res.end("1");
	}
	return true;
}