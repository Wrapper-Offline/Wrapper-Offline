/***
 * asset upload route
 */
// modules
const formidable = require("formidable");
const fs = require("fs");
const Lame = require("node-lame").Lame;
const mp3Duration = require("mp3-duration");
// stuff
const asset = require("./main");

module.exports = function (req, res, url) {
	if (req.method != "POST") return;

	switch (url.pathname) {
		case "/api/asset/upload": { // asset uploading
			new formidable.IncomingForm().parse(req, (e, f, files) => {
				if (!files.import || !f) { // validate the form data
					res.statusCode = 400;
					res.end();
					return;
				}

				const file = files.import;
				const filepath = files.import.path, buffer = fs.readFileSync(filepath);

				let name;
				if (!f.name || f.name == "") // default to the filename
					name = file.name.substring(0, name.lastIndexOf("."));
				else { // parse the name
					name = f.name;
					// replace invalid chars
					name = name.replace(/[\s.]*/g, "_");
				}

				const ext = file.name.substring(file.name.lastIndexOf(".") + 1);
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
							meta.duration = 1e3 * duration;
							asset.save(buffer, meta);
						});
						break;
					} default: {
						asset.save(buffer, meta);
						break;
					}
				}
				fs.unlinkSync(filepath);
				res.end(JSON.stringify({ status: "ok" }));
			});
			return true;
		}
		case "/goapi/saveSound/": { // asset uploading
			new formidable.IncomingForm().parse(req, (e, f, files) => {
				let isRecord = false;
				if (f.bytes) isRecord = true;

				let buffer;
				switch (isRecord) {
					case true: {
						buffer = Buffer.from(f.bytes, "base64");
						break;
					} default: {
						const path = files.Filedata.path;
						buffer = fs.readFileSync(path);
						break;
					}
				}
				
				let meta = {
					type: "sound",
					subtype: f.subtype,
					title: f.title,
					ext: "mp3",
					tId: "ugc"
				};

				const encoder = new Lame({
					"output": "buffer",
					"bitrate": 192
				}).setBuffer(buffer);
				// we're just going to guess it's not an mp3
				encoder.encode()
					.then(() => {
						const buf = encoder.getBuffer();
						mp3Duration(buf, (e, duration) => {
							if (e || !duration) return;
							Object.assign(meta, { duration: 1e3 * duration });
							const id = asset.save(buf, meta);
							res.end(
								`0<response><asset><id>${id}.mp3</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>${meta.subtype}</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}.mp3</file></asset></response>`
							);
						});
					})
					.catch(err => {
						if (process.env.NODE_ENV == "dev") throw err;
						console.error("Error saving sound: " + err)
						res.end(process.env.FAILURE_XML)
					});
			});
			return true;
		}
		default: return;
	}
}