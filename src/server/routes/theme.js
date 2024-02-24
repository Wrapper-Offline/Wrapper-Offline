const httpz = require("@octanuary/httpz");
const { join } = require("path");
const settings = require("../../data/settings.js").instance;
const fileUtil = require("../../utils/fileUtil.js");

const folder = join(__dirname, "../../../server", process.env.STORE_URL);
const group = new httpz.Group();

/*
list
*/
group.route("POST", "/goapi/getThemeList/", async (req, res) => {
	const truncated = settings.truncatedThemeList;
	const filepath = truncated ? 
		"themelist.xml" : 
		"themelist-allthemes.xml";
	const xmlPath = join(folder, filepath);
	const zip = await fileUtil.zippy(xmlPath, "themelist.xml");
	res.setHeader("Content-Type", "application/zip");
	res.end(zip);
});

/*
load
*/
group.route("POST", "/goapi/getTheme/", async (req, res) => {
	const id = req.body.themeId;
	if (!id) {
		return res.status(400).json({msg:"Expected parameter 'themeId' on the request body."});
	}

	const xmlPath = join(folder, `${id}/theme.xml`);
	const zip = await fileUtil.zippy(xmlPath, "theme.xml");
	res.setHeader("Content-Type", "application/zip");
	res.end(zip);
});

module.exports = group;
