/**
 * character upload route
 */
// modules
const fs = require("fs");
// stuff
const Char = require("./main");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/upload_character") return;

	console.log(files.import[0].filepath);
	const path = files.import[0].filepath, buffer = fs.readFileSync(path);
	const meta = {
		type: "char",
		subtype: 0,
		title: "Untitled",
		ext: "xml",
		tId: Char.getTheme(buffer)
	};
	try {
		// save the char
		const id = Char.save(buffer, meta);
		const url = `/cc?themeId=family&original_asset_id=${id}`;
		fs.unlinkSync(path);
		// redirect the user
		res.statusCode = 302;
		res.setHeader("Location", url);
		res.end();
	} catch (err) {
		console.error("Error uploading character: " + err);
		res.statusCode = 500;
		res.end("00");
	}
	return true;
}
