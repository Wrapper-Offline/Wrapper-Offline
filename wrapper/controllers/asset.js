const Asset = require("../models/asset");
const database = require("../../data/database"), DB = new database();
const ffmpeg = require("fluent-ffmpeg");
const { fromFile } = require("file-type");
const { extensions, mimeTypes } = require("file-type/supported");
const fs = require("fs");
const httpz = require("@octanuary/httpz");
const nodezip = require("node-zip");
const path = require("path");
const tempfile = require("tempfile");
const fileUtil = require("../../utils/fileUtil");
const fileTypes = require("../data/fileTypes.json");
const header = process.env.XML_HEADER;
const thumbUrl = process.env.THUMB_BASE_URL;
const group = new httpz.Group();

ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);

function listAssets(filters) {
	const files = DB.select("assets", filters);
	if (filters.type == "effect") {
		// effects list backwards on the lvm idk why
		files.reverse();
	}
	return `${header}<ugc id="ugc" more="0">${
		files.map(Asset.meta2Xml).join("")}</ugc>`;
}

/*
delete
*/
group.route("POST", "/api_v2/asset/delete/", (req, res) => {
	const id = req.body.data.id || req.body.data.starter_id;
	res.assert(id, 400, { status: "error" });

	if (!DB.delete("assets", id)) {
		res.json({ status: "ok" });
	} else {
		res.statusCode = 404;
		res.json({ status: "error" });
	}
});

/*
list
*/
group.route("GET", "/api/assets/list", (req, res) => {
	res.json(DB.select("assets"));
});
group.route("POST", "/api_v2/assets/imported", (req, res) => {
	if (!req.body.data) { // builds < 2016
		res.assert(req.body.type, 400, { status: "error" });
		if (req.body.type == "prop") req.body.subtype ||= 0;
		res.end(listAssets(req.body));
	} else { // >= 2016
		res.assert(req.body.data.type, 400, { status: "error" });
		if (req.body.data.type == "prop") req.body.data.subtype ||= 0;
	
		// what's even the point of this if it still uses an xml
		// it's dumb
		res.json({
			status: "ok",
			data: {
				xml: listAssets(req.body.data)
			}
		});
	}
});
group.route("POST", ["/goapi/getUserAssets/", "/goapi/getUserVideoAssets/"], (req, res) => {
	if (!req.body.type) {
		if (req.parsedUrl.pathname == "/goapi/getUserVideoAssets/") {
			req.body.type = "prop";
			req.body.subtype = "video";
		} else {
			req.status(400);
			return res.end("1<e></e>");
		}
	}
	const zip = nodezip.create();
	
	const filters = {
		type: req.body.type
	};
	if (req.body.type == "prop") {
		req.body.subtype ||= 0;
		filters.subtype = req.body.subtype;
	}

	const files = DB.select("assets", filters);
	for (const asset of files) {
		if (asset.type == "movie") {
			const xmlPath = path.join(__dirname, "../../_SAVED", asset.id + ".xml");
			const thumbPath = path.join(__dirname, "../../_SAVED", asset.id + ".png");
			const xml = fs.readFileSync(xmlPath);
			const thumb = fs.readFileSync(thumbPath);

			const pathBase = `movie/${asset.id}`;
			fileUtil.addToZip(zip, pathBase + ".xml", xml);
			fileUtil.addToZip(zip, pathBase + ".png", thumb);
		} else {
			const buffer = Asset.load(asset.id, true);
			let filepath = `${asset.type}/${asset.id}`;
			fileUtil.addToZip(zip, filepath, buffer);
			if (asset.subtype == "video") {
				const thumbnailPath = path.join(__dirname, "../../_ASSETS", asset.id.slice(0, -3) + "png");
				const thumbnail = fs.readFileSync(thumbnailPath);
				fileUtil.addToZip(zip, `${asset.type}/${asset.id.slice(0, -3) + "png"}`, thumbnail);
			}
		}
	}

	fileUtil.addToZip(zip, "desc.xml", listAssets(filters));
	res.setHeader("Content-Type", "application/zip");
	zip.zip().then((b) => res.end(Buffer.concat([Buffer.from([0x0]), b])));
});
group.route("POST", "/goapi/getUserAssetsXml/", (req, res) => {
	const filters = {
		type: req.body.type
	};
	if (req.body.type == "char") {
		if (!req.body.themeId) {
			res.statusCode = 400;
			res.end("1<error><code>malformed</code><message>no themeId</message></error>");
			return;
		}
		switch (req.body.themeId) {
			case "custom":
				themeId = "family";
				break;
			case "action":
			case "animal":
			case "botdf":
			case "space":
			case "vietnam":
				themeId = "cc2";
				break;
			default:
				themeId = req.body.themeId;
		}
	} else if (req.body.type == "prop") {
		// separate normal and video props
		req.body.subtype ||= 0;
		filters.subtype = req.body.subtype;
	}
	if (req.body.assetId && req.body.assetId !== "null") {
		// used only for the character creator window mod
		filters.id = req.body.assetId;
	}

	res.setHeader("Content-Type", "application/xml");
	res.end(listAssets(filters));
});

/*
load
*/
group.route("*", /\/(assets|goapi\/getAsset|static\/store\/ugc\/effect)\/([\S]*)/, (req, res, next) => {
	let id;
	switch (req.method) {
		case "GET":
			id = req.body.assetId = req.matches[2];
			break;
		case "POST":
			id = req.body.assetId;
			break;
		default:
			next();
			return;
	}
	if (!id) {
		res.statusCode = 400;
		res.end();
	}

	try {
		const ext = id.split(".")[1] || "xml";
		const mime = mimeTypes[extensions.indexOf(ext)];
		const readStream = Asset.load(id);
		res.setHeader("Content-Type", mime);
		readStream.pipe(res);
	} catch (err) {
		if (err.message === "404") {
			res.statusCode = 404;
			res.end();
		} else {
			console.log("Error loading asset:", err);
			res.statusCode = 500;
			res.end();
		}
	}
});

/*
thumb
*/
group.route("GET", /\/stock_thumbs\/([\S]+)/, (req, res) => {
	const filepath = path.join(__dirname, "../../", thumbUrl, req.matches[1]);
	if (fs.existsSync(filepath)) {
		fs.createReadStream(filepath).pipe(res);
	} else {
		res.status(404);
		res.end();
	}
});

/*
info
*/
// get
group.route("POST", "/api_v2/asset/get", (req, res) => {
	const id = req.body?.data.id || req.body?.data.starter_id;
	res.assert(id, 400, { status: "error" });

	const info = DB.get("assets", id)?.data;
	if (info) {
		// add stuff that will never be useful in an offline lvm clone
		info.share = { type: "none" };
		info.published = "";
		res.json({
			status: "ok",
			data: info
		});
	} else {
		res.statusCode = 404;
		res.json({ status: "not_found" });
	}
});
group.route("POST", "/goapi/getLatestAsset/", (req, res) => {
	res.end("0");
});
// update
group.route("POST", "/api_v2/asset/update/", (req, res) => {
	const id = req.body.data.id || req.body.data.starter_id;
	const title = req.body.data.title;
	const tags = req.body.data.tags;
	if (!id || !title || !tags) {
		res.statusCode = 400;
		res.json({ status: "malformed" });
	}

	const update = {
		tags: tags,
		title: title
	}
	if (DB.update("assets", id, update)) {
		res.json({ status: "ok" });
	} else {
		res.statusCode = 404;
		res.json({ status: "not_found" });
	}
});

/*
save
*/
group.route("POST", "/api/asset/upload", async (req, res) => {
	const file = req.files.import;
	if (typeof file === "undefined" && !req.body.type && !req.body.subtype) {
		res.statusCode = 400;
		res.json({ status: "malformed" });
	}

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
				stream = await fileUtil.resizeImage(filepath, 550, 354);
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
					stream = await fileUtil.convertToMp3(filepath, ext);
				} else {
					stream = fs.createReadStream(filepath);
				}
				const temppath = tempfile(".mp3");
				const writeStream = fs.createWriteStream(temppath);
				stream.pipe(writeStream);
				stream.on("end", async () => {
					info.duration = await fileUtil.mp3Duration(temppath);
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
						if (e) return rej(e);
						info.width = data.streams[0].width || data.streams[1].width;
						info.height = data.streams[0].height || data.streams[1].height;

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
});
group.route("POST", ["/goapi/saveProp/", "/goapi/saveBackground/", "/goapi/saveEffect/"], async (req, res) => {
	const filepath = req.files.Filedata.filepath;
	const { ext } = await fromFile(filepath);
	if (fileTypes.prop.indexOf(ext) < 0) {
		res.status(400);
		return res.end("1<e><code>UNSUPPORTED_IMAGE_FORMAT</code></e>");
	}

	let info = {
		type: req.body.type,
		title: req.body.title
	};
	if (info.type == "prop") {
		info.subtype = "0";
		info.ptype = "placeable";
		if (req.body.holdable == "1") {
			info.ptype = "holdable";
		} else if (req.body.headable == "1") {
			info.ptype = "headable";
		}
	}

	const id = await Asset.save(filepath, ext, info);
	if (info.type == "effect") {
		info.id = id;
		return res.end("0" + Asset.meta2Xml(info));
	}
	res.end(`0<asset><type>${info.type}</type><subtype>${info.subtype}</subtype><file>${id}</file><id>${id}</id></asset>`);
});
group.route("POST", "/goapi/saveVideo/", async (req, res) => {
	const filepath = req.files.Filedata.filepath;
	const { ext } = await fromFile(filepath);
	if (fileTypes.video.indexOf(ext) < 0) {
		res.status(400);
		return res.end("1<e><code>UNSUPPORTED_IMAGE_FORMAT</code></e>");
	}

	let info = {
		type: "prop",
		subtype: "video",
		title: req.body.title
	}, id = fileUtil.generateId() + ".flv";

	res.end(`0<asset><type>prop</type><subtype>video</subtype><title>${info.title}</title><published>0</published><tags></tags><width>0</width><height>0</height><file>${id}</file><id>${id}</id></asset>`);
	const temppath = tempfile(".flv");
	await new Promise((resolve, rej) => {
		// get the height and width
		ffmpeg(filepath).ffprobe((e, data) => {
			if (e) return rej(e);
			info.width = data.streams[0].width || data.streams[1].width;
			info.height = data.streams[0].height || data.streams[1].height;

			// convert the video to an flv
			ffmpeg(filepath)
				.output(temppath)
				.on("end", async () => {
					const readStream = fs.createReadStream(temppath);
					await Asset.save(readStream, id, info);

					// save the first frame
					ffmpeg(filepath)
						.seek("0:00")
						.output(path.join(
							__dirname,
							"../../",
							process.env.ASSET_FOLDER,
							id.slice(0, -3) + "png"
						))
						.outputOptions("-frames", "1")
						.on("end", () => resolve(id))
						.run();
				})
				.on("error", (e) => rej("Error converting video:", e))
				.run();
		});
	});
});
group.route("POST", "/goapi/saveSound/", async (req, res) => {
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
		stream = await fileUtil.convertToMp3(filepath, ext);
	} else {
		stream = fs.createReadStream(filepath);
	}

	const temppath = tempfile(".mp3");
	const writeStream = fs.createWriteStream(temppath);
	stream.pipe(writeStream);
	stream.on("end", async () => {
		info.duration = await fileUtil.mp3Duration(temppath);
		const id = await Asset.save(temppath, "mp3", info);
		res.end(
			`0${req.body.placeable?"":"<response>"}<asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>${info.subtype}</subtype><title>${info.title}</title><published>0</published><tags></tags><duration>${info.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset>${req.body.placeable?"":"</response>"}`
		);
	});
});

module.exports = group;
