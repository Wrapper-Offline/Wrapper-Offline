/**
 * route
 * asset saving
 */
// modules
const fs = require("fs");
const Lame = require("node-lame").Lame;
const mp3Duration = require("mp3-duration");
// stuff
const asset = require("./main");

module.exports = async function (req, res, url) {
	if (req.method != "POST") return;

	switch (url.pathname) {
		case "/api/asset/upload": { // asset uploading
			const file = req.files.import;
			if (!file || !req.body) { // validate the form data
				res.statusCode = 400;
				res.end();
				return true;
			}
			const origName = file.originalFilename;
			const [filename, ext] = origName.splitIndex(origName.lastIndexOf("."));
			console.log(filename);
			console.log(ext);
			const name = req.body.name || filename;
			const path = file.filepath, stream = fs.createReadStream(path);
			stream.on("end", () => console.log("EEEEEEEEEEE"));

			console.log("stream")

			let meta = {
				type: req.body.type,
				subtype: req.body.subtype,
				title: name,
				ext: ext,
				tId: "ugc"
			};

			let aId;
			switch (req.body.type) {
				case "sound": {
					// get the sound duration
					mp3Duration(stream, async (e, duration) => {
						if (e || !duration) return;
						meta.duration = 1e3 * duration;
						aId = await asset.saveStream(stream, meta);
					});
					break;
				} default: {
					aId = await asset.saveStream(stream, meta);
					break;
				}
			}
			//fs.unlinkSync(path);
			res.end(JSON.stringify({
				status: "ok", 
				data: {
					id: aId,
					enc_asset_id: aId,
					file: aId + `.${ext}`,
					title: name,
					tags: ""
				}
			}));
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