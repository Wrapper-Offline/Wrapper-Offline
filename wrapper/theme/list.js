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
 * Zips the themelist XML.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/getThemeList/")
		return;

	const xmlPath = path.join(folder, "themelist.xml");
	try {
		const zip = await fUtil.zippy(xmlPath, "themelist.xml");
		res.setHeader("Content-Type", "application/zip");
		res.end(zip);
	} catch (err) {
		console.error("Error generating themelist ZIP: " + err);
		res.statusCode = 500;
		res.end("1");
	}
	// remember, this is in Array.prototype.findAsync()!
	return true;
}