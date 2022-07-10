/**
 * theme routes
 */
// modules
const httpz = require("httpz");
const path = require("path");
// vars
const folder = path.join(__dirname, "../../server", process.env.STORE_URL);
// stuff
const database = require("../../data/database"), DB = new database(true);
const fUtil = require("../../utils/fileUtil");

// create the group
const group = new httpz.Group();

group
	// list
	.route("POST", "/goapi/getThemeList/", async (req, res) => {
		const truncated = DB.select().TRUNCATED_THEMELIST;
		const filepath = truncated ? 
			"themelist.xml" : 
			"themelist-allthemes.xml";
		const xmlPath = path.join(folder, filepath);
		const zip = await fUtil.zippy(xmlPath, "themelist.xml");
		res.setHeader("Content-Type", "application/zip");
		res.end(zip);
	})
	// load
	.route("POST", "/goapi/getTheme/", async (req, res) => {
		const id = req.body.themeId;
		res.assert(id, 500, "Missing one or more fields.");

		const xmlPath = path.join(folder, `${id}/theme.xml`);
		const zip = await fUtil.zippy(xmlPath, "theme.xml");
		res.setHeader("Content-Type", "application/zip");
		res.end(zip);
	});

module.exports = group;
