/***
 * character upload route
 */
const formidable = require("formidable");
const fs = require("fs");
const char = require("./main");

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/upload_character") return;
	new formidable.IncomingForm().parse(req, (e, f, files) => {
		const path = files.import.path, buffer = fs.readFileSync(path);
		const meta = {
			type: "char",
			subtype: 0,
			title: "Untitled",
			ext: "xml",
			tId: char.getTheme(buffer)
		};
		try {
			// save the char
			const id = char.save(buffer, meta);
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
	});
	return true;
}
