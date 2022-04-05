/***
 * asset upload route
 */
const formidable = require("formidable");
const fs = require("fs");
const mp3Duration = require("mp3-duration");
const asset = require("./main");

module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.path) {
		case "/api/asset/upload": { // asset uploading
			new formidable.IncomingForm().parse(req, (e, f, files) => {
				if (!files.import || !f) {
					res.statusCode = 400;
					res.end();
					return;
				}
				const path = files.import.path, buffer = fs.readFileSync(path);

				let name;
				if (!f.name || f.name == "") 
					name = files.import.name.substring(0, name.lastIndexOf("."));
				else
					name = f.name;
				
				console.log(files.import)
				const ext = files.import.name.substring(name.lastIndexOf(".") + 1);
				let meta = {
					type: f.type,
					subtype: f.subtype,
					title: name,
					ext: ext,
					tId: "ugc"
				};
				switch (f.type) {
					case "sound": {
						mp3Duration(buffer, (e, duration) => {
							if (e || !duration) return;
							Object.assign(meta, { duration: 1e3 * duration });
							asset.save(buffer, meta);
						});
						break;
					}
					default: {
						asset.save(buffer, meta);
						break;
					}
				}
				fs.unlinkSync(path);
				res.end(JSON.stringify({ status: "ok" }));
			});
			return true;
		}
		default: return;
	}
}