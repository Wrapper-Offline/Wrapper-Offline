/**
 * asset routes
 */
// modules
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);
const { fromFile } = require("file-type");
const fs = require("fs");
const httpz = require("httpz");
const mime = require("mime-types");
const path = require("path");
const tempfile = require("tempfile");
// vars
const fileTypes = require("../data/fileTypes.json");
const header = process.env.XML_HEADER;
const thumbUrl = process.env.THUMB_BASE_URL;
// stuff
const Asset = require("../models/asset");
const database = require("../../data/database"), DB = new database();
const rFileUtil = require("../../utils/realFileUtil");

// create the group
const group = new httpz.Group();

function listAssets(filters) {
	const files = DB.select("assets", filters);
	return `${header}<ugc more="0">${
		files.map(Asset.meta2Xml).join("")}</ugc>`;
}

group
	// delete
	.route("POST", "/api_v2/asset/delete/", (req, res) => {
		const id = req.body.data.id || req.body.data.starter_id;
		res.assert(id, 400, { status: "error" });

		try {
			DB.delete("assets", id);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error deleting asset:", e);
			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})
	// list
	.route("POST", "/goapi/getUserAssetsXml/", (req, res) => {
		res.assert(
			req.body.type,
			req.body.type == "char",
			req.body.themeId,
			400,
			"1Missing one or more fields."
		);

		let themeId;
		switch (req.body.themeId) {
			case "custom":
				themeId = "family"; break;
			case "action":
			case "animal":
			case "botdf":
			case "space":
				themeId = "cc2"; break;
			default: themeId = req.body.themeId;
		}

		const filters = {
			themeId,
			type: "char"
		};
		res.setHeader("Content-Type", "application/xml");
		res.end(listAssets(filters));
	})
	.route("POST", "/api_v2/assets/imported", (req, res) => {
		res.assert(req.body.data.type, 400, { status: "error" });
		if (req.body.data.type == "prop") req.body.data.subtype ||= 0;

		res.json({
			status: "ok",
			data: {
				xml: listAssets(req.body.data)
			}
		});
	})
	.route("GET", "/api/assets/list", (req, res) => {
		res.json(DB.select("assets"));
	})
	// load
	.route(
		"POST",
		[
			"/goapi/getAsset/",
			"/goapi/getAssetEx/"
		],
		(req, res) => {
			const id = req.body.assetId;
			res.assert(id, 400, "Missing one or more fields.");

			try {
				const readStream = Asset.load(id);
				res.setHeader("Content-Type", mime.contentType(id));
				readStream.pipe(res);
			} catch (e) {
				console.log("Error loading asset:", e);
				res.status(404).end();
			}
		}
	)
	.route("*", /\/(assets|goapi\/getAsset)\/([\S]+)/, (req, res) => {
		const id = req.matches[2];

		try {
			const readStream = Asset.load(id);
			res.setHeader("Content-Type", mime.contentType(id));
			readStream.pipe(res);
		} catch (e) {
			console.log("Error loading asset:", e);
			res.status(404).end();
		}
	})
	// meta
	//  #get
	.route("POST", "/api_v2/asset/get", (req, res) => {
		const id = req.body?.data.id || req.body?.data.starter_id;
		res.assert(id, 400, { status: "error" });

		try {
			const info = DB.get("assets", id).data;
			// add stuff that will never be useful for an offline lvm clone
			info.share = { type: "none" };
			info.published = "";
			res.json({
				status: "ok",
				data: info
			});
		} catch (e) {
			console.log("Error getting asset info:", e);
			res.statusCode = 404;
			res.json({ status: "error", data: "That doesn't seem to exist." });
		}
	})
	//  #update
	.route("POST", "/api_v2/asset/update/", (req, res) => {
		const id = req.body.data.id || req.body.data.starter_id;
		res.assert(id, 400, { status: "error" });

		try {
			DB.update("assets", id, req.body.data);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error updating asset:", e);
			console.log("It's not like anyone will see this anyway...");

			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})
	// save
	.route("POST", "/api/asset/upload", async (req, res) => {
		const file = req.files.import;
		res.assert(
			file,
			req.body.type,
			req.body.subtype,
			400,
			{
				status: "error",
				msg: "Missing one or more fields."
			}
		);
	
		// get the filename and extension
		const { filepath } = file;
		const origName = file.originalFilename;
		const filename = path.parse(origName).name;
		const { ext } = await fromFile(filepath);

		// validate the file type
		if ((fileTypes[req.body.type] || []).indexOf(ext) < 0) {
			res.status(400);
			res.json({
				status: "error",
				msg: "Invalid file type."
			});
			return;
		}

		let info = {
			type: req.body.type,
			subtype: req.body.subtype,
			title: req.body.name || filename,
		}, stream;

		switch (info.type) {
			case "bg" : {
				if (ext == "swf") {
					stream = fs.createReadStream(filepath);
				} else {
					stream = await rFileUtil.resizeImage(filepath, 550, 354);
				}
				stream.pause();

				// save asset
				info.file = await Asset.save(stream, ext, info);
				break;
			}
			case "watermark": {
				stream = fs.createReadStream(filepath);
				stream.pause();

				// save asset
				info.file = await Asset.save(stream, ext, info);
				break;
			}
			case "sound": {
				await new Promise(async (resolve, reject) => {
					if (ext != "mp3") {
						stream = await rFileUtil.convertToMp3(filepath, ext);
					} else {
						stream = fs.createReadStream(filepath);
					}
					const temppath = tempfile(".mp3");
					const writeStream = fs.createWriteStream(temppath);
					stream.pipe(writeStream);
					stream.on("end", async () => {
						info.duration = await rFileUtil.mp3Duration(temppath);
						info.file = await Asset.save(temppath, "mp3", info);
						info.downloadtype = "progressive";
						resolve();
					});
				});
				break;
			}
			case "prop": {
				let { ptype } = req.body;
				// verify the prop type
				switch (ptype) {
					case "placeable":
					case "wearable":
					case "holdable":
						info.ptype = ptype;
					default:
						info.ptype = "placeable";
				}

				if (info.subtype == "video") {
					delete info.ptype;
					const temppath = tempfile(".flv");
					await new Promise((resolve, rej) => {
						// get the height and width
						ffmpeg(filepath).ffprobe((e, data) => {
							if (e) rej(e);
							info.width = data.streams[0].width;
							info.height = data.streams[0].height;

							// convert the video to an flv
							ffmpeg(filepath)
								.output(temppath)
								.on("end", async () => {
									const readStream = fs.createReadStream(temppath);
									info.file = await Asset.save(readStream, "flv", info);

									// save the first frame
									ffmpeg(filepath)
										.seek("0:00")
										.output(path.join(
											__dirname,
											"../../",
											process.env.ASSET_FOLDER,
											info.id.slice(0, -3) + "png"
										))
										.outputOptions("-frames", "1")
										.on("end", () => resolve(info.id))
										.run();
								})
								.on("error", (e) => rej("Error converting video:", e))
								.run();
						});
					});
				} else {
					info.file = await Asset.save(filepath, ext, info);
				}
				break;
			}
			default: {
				res.status(400);
				res.json({
					status: "error",
					msg: "Invalid asset type."
				});
				return;
			}
		}

		// stuff for the lvm
		info.enc_asset_id = info.file;

		res.json({
			status: "ok", 
			data: info
		});
	})
	.route("POST", "/goapi/saveSound/", async (req, res) => {
		isRecord = req.body.bytes ? true : false;

		let filepath, ext, stream;
		if (isRecord) {
			filepath = tempfile(".ogg");
			ext = "ogg";
			const buffer = Buffer.from(req.body.bytes, "base64");
			fs.writeFileSync(filepath, buffer);
		} else {
			// read the file
			filepath = req.files.Filedata.filepath;
			ext = (await fromFile(filepath)).ext;
		}

		let info = {
			type: "sound",
			subtype: req.body.subtype,
			title: req.body.title
		};

		if (ext != "mp3") {
			stream = await rFileUtil.convertToMp3(filepath, ext);
		} else {
			stream = fs.createReadStream(filepath);
		}

		const temppath = tempfile(".mp3");
		const writeStream = fs.createWriteStream(temppath);
		stream.pipe(writeStream);
		stream.on("end", async () => {
			info.duration = await rFileUtil.mp3Duration(temppath);
			const id = await Asset.save(temppath, "mp3", info);
			res.end(
				`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>${info.subtype}</subtype><title>${info.title}</title><published>0</published><tags></tags><duration>${info.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`
			);
		});
	})
	// thumb
	.route("GET", /\/stock_thumbs\/([\S]+)/, (req, res) => {
		const filepath = path.join(__dirname, "../../", thumbUrl, req.matches[1]);
		if (fs.existsSync(filepath)) {
			fs.createReadStream(filepath).pipe(res);
		} else {
			res.status(404);
			res.end();
		}
	});

module.exports = group;
