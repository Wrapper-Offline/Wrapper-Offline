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

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
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
			// get the filename and extension
			const origName = file.originalFilename;
			const dotIn = origName.lastIndexOf(".");
			const filename = origName.substring(0, dotIn);
			const ext = origName.substring(dotIn + 1);
			// read the file
			const path = file.filepath, stream = fs.createReadStream(path);
			stream.pause();

			let meta = {
				type: req.body.type,
				subtype: req.body.subtype,
				title: req.body.name || filename,
				ext: ext,
				tId: "ugc"
			};
			let aId;
			switch (req.body.type) {
				case "sound": {
					// get the sound duration
					await new Promise((resolve, rej) => {
						mp3Duration(path, async (e, duration) => {
							if (e || !duration) return console.error("Error getting sound duration:", e);
							meta.duration = 1e3 * duration;
							aId = asset.saveStream(stream, meta);
							resolve();
						});
					});
					break;
				} default: {
					aId = asset.saveStream(stream, meta);
					break;
				}
			}
			//fs.unlinkSync(path);
			res.end(JSON.stringify({
				status: "ok", 
				data: {
					type: meta.type,
					subtype: meta.subtype,
					id: `${aId}.${ext}`,
					enc_asset_id: `${aId}.${ext}`,
					file: `${aId}.${ext}`,
					duration: meta.duration,
					title: meta.title,
					tags: ""
				}
			}));
			return true;
		}
		/*case "/goapi/saveSound/": { // sound recording/uploading through the lvm
				let isRecord = false;
				if (req.body.bytes) isRecord = true;

				let buffer;
				switch (isRecord) {
					case true: {
						buffer = Buffer.from(req.body.bytes, "base64");
						break;
					} default: {
						const path = req.files.Filedata.path;
						buffer = fs.readFileSync(path);
						break;
					}
				}
				
				let meta = {
					type: "sound",
					subtype: req.body.subtype,
					title: req.body.title,
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
						//if (process.env.NODE_ENV == "dev") throw err;
						console.error("Error saving sound: " + err)
						res.end(process.env.FAILURE_XML)
					});
			
			return true;
		}*/
		default: return;
	}
}