/**
 * route
 * asset saving
 */
// modules
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);
const { Readable } = require("stream");
const fs = require("fs");
const mp3Duration = require("mp3-duration");
const sharp = require("sharp");
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
				themeId: "ugc"
			};
			let aId;
			switch (meta.type) {
				case "sound": {
					// get the sound duration
					await new Promise((resolve, rej) => {
						mp3Duration(path, async (e, duration) => {
							if (e || !duration) rej("Error getting sound duration:", e);
							meta.duration = 1e3 * duration;
							aId = asset.saveStream(stream, meta);
							resolve();
						});
					});
					meta.downloadtype = "progressive";
					break;
				} case "bg": {
					await new Promise((resolve, rej) => {
						let buffers = [];
						stream.resume();
						stream.on("data", b => buffers.push(b));
						stream.on("end", async () => {
							const buf = Buffer.concat(buffers);
							const buffer = await sharp(buf)
								.resize(550, 354, { fit: "fill" })
								.toBuffer();
							aId = asset.save(buffer, meta);
							resolve();
						});
					});
					break;
				} case "prop": {
					let { ptype } = req.body;
					// verify the prop type
					switch (ptype) {
						case "placeable":
						case "wearable":
						case "holdable":
							break;
						default: ptype = "placeable";
					}

					if (meta.subtype == "video") {
						meta.ext = "flv";
						const oldPath = `${process.env.CACHÉ_FOLDER}/t.mp4`;
						const newPath = `${process.env.CACHÉ_FOLDER}/t.flv`;
						await new Promise((resolve, rej) => {
							// save the temp files
							const writeStream = fs.createWriteStream(oldPath);
							stream.resume();
							stream.pipe(writeStream);

							// convert the video to an flv
							ffmpeg(oldPath)
								.ffprobe((e, data) => {
									if (e) rej(e);
									meta.width = data.streams[0].width;
									meta.height = data.streams[0].height;

									// convert the video to an flv
									ffmpeg(oldPath)
										.output(newPath)
										.on("end", () => {
											const buffer = fs.readFileSync(newPath);
											aId = asset.save(buffer, meta);

											// save the first frame
											ffmpeg(oldPath)
												.seek("0:00")
												.output(`${process.env.ASSET_FOLDER}/${aId.slice(0, -3) + "png"}`)
												.outputOptions("-frames", "1")
												.on("end", () => resolve(aId))
												.run();
										})
										.on("error", (e) => rej("Error converting video:", e))
										.run();
								});
						});
						fs.unlinkSync(oldPath);
						fs.unlinkSync(newPath);
						break;
					}

					meta.ptype = ptype;
				} default: {
					aId = asset.saveStream(stream, meta);
					break;
				}
			}

			meta.enc_asset_id = meta.file = aId;
			res.end(JSON.stringify({
				status: "ok", 
				data: meta
			}));
			return true;
		}
		case "/goapi/saveSound/": { // sound recording/uploading through the lvm
			isRecord = req.body.bytes ? true : false;

			let oldStream, stream, ext;
			if (isRecord) {
				const buffer = Buffer.from(req.body.bytes, "base64");
				oldStream = Readable.from(buffer);
				ext = "ogg";
			} else {
				// read the file
				const path = req.files.Filedata.filepath
				oldStream = fs.createReadStream(path);
				// get the extension
				const origName = req.body.Filename;
				const dotIn = origName.lastIndexOf(".");
				ext = origName.substring(dotIn + 1);
			}
			
			let meta = {
				type: "sound",
				subtype: req.body.subtype,
				title: req.body.title,
				ext: "mp3",
				themeId: "ugc"
			};
			
			if (ext !== "mp3") {
				await new Promise((resolve, rej) => {
					// convert the sound to an mp3
					const command = ffmpeg(oldStream)
						.inputFormat(ext)
						.toFormat("mp3")
						.on("error", (e) => rej("Error converting audio:", e));
					stream = command.pipe();
					resolve();
				});
			} else stream = oldStream;

			let buffers = [];
			stream.resume();
			stream.on("data", b => buffers.push(b));
			stream.on("end", () => {
				const buf = Buffer.concat(buffers);
				mp3Duration(buf, (e, duration) => {
					if (e || !duration) return;
					meta.duration = 1e3 * duration;
					const aId = asset.save(buf, meta);
					res.end(
						`0<response><asset><id>${aId}</id><enc_asset_id>${aId}</enc_asset_id><type>sound</type><subtype>${meta.subtype}</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${aId}</file></asset></response>`
					);
				});
				return true;
			});
		}
		default: return;
	}
}
