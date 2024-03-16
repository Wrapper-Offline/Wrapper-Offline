/*
feel so clean like a money machine
*/

const AssetModel = require("../models/asset.js");
const ffmpeg = require("fluent-ffmpeg");
const fileTypes = require("../../staticInfo/fileTypes.json");
const fileUtil = require("../../utils/fileUtil.js");
const { fromFile } = require("file-type");
const { extensions, mimeTypes } = require("file-type/supported.js");
const fs = require("fs");
const httpz = require("@octanuary/httpz");
const path = require("path");
const tempfile = require("tempfile");
const { promisify } = require("util");
const sharp = require("sharp");
const mp3Duration = require("mp3-duration");

ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);

const group = new httpz.Group();

/*
delete
*/
group.route("POST", "/api_v2/asset/delete/", (req, res) => {
	const id = req.body.data.id || req.body.data.starter_id;
	if (!id) {
		return res.status(400).json({status:"error"});
	}

	try {
		AssetModel.delete(id);
		res.json({status: "ok"});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status: "error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status: "error"});
	}
});

/*
list
*/
group.route("POST", "/api_v2/assets/imported", (req, res) => {
	if (!req.body.data.type) {
		return res.status(400).json({msg:"Expected data.type on request body."});
	}
	// filter out video props
	if (req.body.data.type == "prop") {
		req.body.data.subtype ||= 0;
	}

	const filters = {
		type: req.body.data.type
	};
	if (req.body.data.subtype) filters.subtype = req.body.data.subtype;

	// what's even the point of this if it still uses an xml
	// it's dumb
	res.json({
		status: "ok",
		data: {
			xml: AssetModel.list(filters, true)
		}
	});
});
group.route("POST", "/goapi/getUserAssetsXml/", (req, res) => {
	if (req.body.type !== "char") {
		res.status(307).setHeader("Location", "/api_v2/assets/imported")
		return res.end();
	} else if (!req.body.themeId) {
		return res.status(400).end("1<error><code>malformed</code><message/></error>");
	}

	let themeId;
	switch (req.body.themeId) {
		case "custom":
			themeId = "family";
			break;
		case "action":
		case "animal":
		case "space":
		case "vietnam":
			themeId = "cc2";
			break;
		default:
			themeId = req.body.themeId;
	}
	const filters = {
		themeId,
		type: "char"
	};
	// just a little workaround i did for getting character info when i was implementing the cc embed in the vm
	if (req.body.assetId && req.body.assetId !== "null") filters.id = req.body.assetId;

	res.setHeader("Content-Type", "application/xml");
	res.end(AssetModel.list(filters, true));
});

/*
load
*/
group.route("*", /\/(assets|goapi\/getAsset)\/([\S]*)/, (req, res, next) => {
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
		return res.status(400).end();
	}

	try {
		const ext = id.split(".")[1] || "xml";
		const mime = mimeTypes[extensions.indexOf(ext)];
		const readStream = AssetModel.load(id);
		res.setHeader("Content-Type", mime);
		readStream.pipe(res);
	} catch (e) {
		if (e == "404") {
			return res.status(404).end();
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).end();
	}
});

/*
info
*/
// get
group.route("POST", "/api_v2/asset/get", (req, res) => {
	const id = req.body.data?.id ?? req.body.data?.starter_id;
	if (!id) {
		return res.status(404).json({status:"error"});
	}

	try {
		const info = AssetModel.getInfo(id);
		// add stuff that will never be useful in an offline lvm clone because the lvm needs it
		info.share = { type: "none" };
		info.published = "";
		res.json({
			status: "ok",
			data: info
		});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status:"error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
	}
});
// update
group.route("POST", "/api_v2/asset/update/", (req, res) => {
	const id = req.body.data?.id ?? req.body.data?.starter_id ?? null;
	const title = req.body.data?.title ?? null;
	const tags = req.body.data?.tags ?? null;
	if (!id || title === null || tags === null) {
		return res.status(400).json({status:"error"});
	}

	const update = {
		tags: tags,
		title: title
	};
	try {
		AssetModel.updateInfo(id, update);
		res.json({status:"ok"});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status:"error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
	}
});

/*
save
*/
group.route("POST", "/api/asset/upload", async (req, res) => {
	const file = req.files.import;
	if (typeof file === "undefined" || !req.body.type || !req.body.subtype) {
		return res.status(400).json({msg:"Missing required parameters."});
	}

	// get the filename and extension
	const { filepath } = file;
	const filename = path.parse(file.originalFilename).name;
	const ext = (await fromFile(filepath))?.ext;
	if (typeof ext === "undefined") {
		// filetype couldn't be determined
		return res.status(400).json({msg:"File type could not be determined."});
	}

	let info = {
		type: req.body.type,
		subtype: req.body.subtype,
		title: req.body.name || filename
	}, stream;

	// validate the file type
	// oh my god typescript it is defined you stupid dumb fucking bitch
	if ((fileTypes[info.type] || []).indexOf(ext) < 0) {
		return res.status(400).json({msg:"Invalid file type."});
	}

	try {
		switch (info.type) {
			// these 2 are very similar so they can be merged
			case "bg":
			case "watermark": {
				if (info.type == "bg" && ext != "swf") {
					stream = sharp(filepath)
						.resize(550, 354, { fit: "fill" });
						// i dont kown
				} else {
					stream = fs.createReadStream(filepath);
				}
				stream.pause();
	
				// save asset
				info.id = await AssetModel.save(stream, ext, info);
				break;
			}
			case "sound": {
				if (ext != "mp3") {
					stream = await fileUtil.convertToMp3(filepath, ext);
				} else {
					stream = fs.createReadStream(filepath);
				}
				// save it to a tempfile so we can get the mp3 duration
				const temppath = tempfile(".mp3");
				const writeStream = fs.createWriteStream(temppath);
				await new Promise(async (resolve, reject) => (
					stream.on("end", resolve).pipe(writeStream)
				));
				info.duration = await mp3Duration(temppath) * 1e3;
				info.id = await AssetModel.save(temppath, "mp3", info);
				break;
			}
			case "prop": {
				if (info.subtype == "video") {
					// get the height and width from the original video
					const data = await promisify(ffmpeg(filepath).ffprobe)();
					info.width = data.streams[0].width || data.streams[1].width;
					info.height = data.streams[0].height || data.streams[1].width;

					const temppath = tempfile(".flv");
					// convert the video to an flv
					// ffmpeg will infer the flv file type from the temppath
					await new Promise(async (resolve, rej) => {	
						ffmpeg(filepath)
							.output(temppath)
							.on("end", resolve)
							.on("error", rej)
							.run();
					});
					info.id = await AssetModel.save(temppath, "flv", info);

					// AssetModel.save doesn't have thumbnail support so we'll save it here while we're at it
					// hell it might even make things easier
					//
					// define the command outside the promise because for whatever reason
					// typescript does not like it when i use discriminated unions in callbacks
					const command = ffmpeg(filepath)
						.seek("0:00")
						.output(path.join(AssetModel.folder, info.id.slice(0, -3) + "png"))
						.outputOptions("-frames", "1");
					await new Promise(async (resolve, rej) => {
						command
							.on("end", resolve)
							.on("error", rej)
							.run();
					});
				} else if (info.subtype == "0") {
					let { ptype } = req.body;
					// verify the prop type
					switch (ptype) {
						case "placeable":
						case "wearable":
						case "holdable":
							info.ptype = ptype;
							break;
						default:
							info.ptype = "placeable";
					}
					info.id = await AssetModel.save(filepath, ext, info);
				}
				break;
			}
			default: {
				return res.status(400).json({msg:"Invalid asset type."});
			}
		}
		res.json(info);
	} catch (e) {
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
		return;
	}
})
group.route("POST", "/goapi/saveSound/", async (req, res) => {
	let isRecord = req.body.bytes ? true : false;

	let filepath, ext, stream;
	if (isRecord) {
		filepath = tempfile(".ogg");
		ext = "ogg";
		const buffer = Buffer.from(req.body.bytes, "base64");
		fs.writeFileSync(filepath, buffer);
	} else {
		// read the file
		filepath = req.files.Filedata.filepath;
		ext = (await fromFile(filepath))?.ext;
		if (!ext) {
			return res.status(400).json({msg:"File type could not be determined."});
		}
	}

	let info = {
		type: "sound",
		subtype: req.body.subtype,
		title: req.body.title
	};

	try {
		let id;
		if (ext != "mp3") {
			stream = await fileUtil.convertToMp3(filepath, ext);
			filepath = tempfile(".mp3");
			const writeStream = fs.createWriteStream(filepath);
			await new Promise((resolve) => stream.pipe(writeStream).on("end", resolve));
		}
		info.duration = await mp3Duration(filepath) * 1e3;
		id = await AssetModel.save(filepath, "mp3", info);
		res.end(
			`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>${info.subtype}</subtype><title>${info.title}</title><published>0</published><tags></tags><duration>${info.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`
		);
	} catch (e) {
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
		return;
	}
});

module.exports = group;
