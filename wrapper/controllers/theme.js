/**
 * app routes
 */
// modules
const assert = require("node:assert");
const httpz = require("httpz");
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.THEME_FOLDER);
// stuff
const fUtil = require("../fileUtil");

// create the group
const group = new httpz.Group();

group
	.route("POST", "/goapi/getThemeList/", async (req, res) => {
		const xmlPath = path.join(folder, "themelist.xml");
		try {
			const zip = await fUtil.zippy(xmlPath, "themelist.xml");
			res.setHeader("Content-Type", "application/zip");
			res.end(zip);
		} catch (e) {
			console.error("Error generating themelist ZIP:", e);
			res.statusCode = 500;
			res.end();
		}
	})
	.route("POST", "/goapi/getTheme/", async (req, res) => {
		const { themeId: tId } = req.body;
		assert(tId, "Missing one or more fields.");

		const xmlPath = path.join(folder, `${tId}.xml`);
		try {
			const zip = await fUtil.zippy(xmlPath, "theme.xml");
			res.setHeader("Content-Type", "application/zip");
			res.end(zip);
		} catch (e) {
			console.error("Error generating theme ZIP:", e);
			res.statusCode = 500;
			res.end();
		}
	});

module.exports = group;
