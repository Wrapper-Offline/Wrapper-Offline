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

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/getThemeList/")
		return;

	const xmlPath = path.join(folder, "themelist.xml");
	fUtil.zippy(xmlPath, "themelist.xml")
		.then(buf => {
			res.setHeader("Content-Type", "application/zip");
			res.end(buf);
		})
		.catch(err => {
			console.error("Error generating themelist ZIP: " + err);
			res.statusCode = 500;
			res.end("1");
		});
	return true;
}