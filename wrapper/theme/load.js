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

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/getTheme/") {
		return;
	} else if (!req.body.themeId) {
		res.statusCode = 400;
		res.end();
		return;
	}
	
	let theme = req.body.themeId;
	if (theme == "family") theme = "custom";
	const xmlPath = path.join(folder, `${theme}.xml`);
	fUtil.zippy(xmlPath, "theme.xml")
		.then(buf => {
			res.setHeader("Content-Type", "application/zip");
			res.end(buf);
		})
		.catch(err => {
			if (process.env.NODE_ENV == "dev") throw new Error(err);
			console.error("Error generating theme ZIP: " + err);
			res.statusCode = 500;
			res.end("1");
		});
	return true;
}