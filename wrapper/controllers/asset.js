/**
 * app routes
 */
// modules
const fs = require("fs");
const httpz = require("httpz");
const mime = require("mime-types");
// vars
const header = process.env.XML_HEADER;
// stuff
const Asset = require("../models/asset");
const rFileUtil = require("../utils/realFileUtil");

// create the group
const group = new httpz.Group();

function listAssets(filters) {
	const files = Asset.list(filters);
	console.log(files)
	return `${header}<ugc more="0">${
		files.map(Asset.meta2Xml).join("")}</ugc>`;
}

group
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
			case "custom": themeId = "family"; break;
			case "action": themeId = "cc2"; break;
		}

		const filters = {
			themeId,
			type: "char"
		}
		console.log(filters.themeId)
		res.setHeader("Content-Type", "application/xml");
		res.end(listAssets(filters));
	})
	.route("POST", "/api_v2/assets/imported", (req, res) => {
		res.assert(req.body.data.type, 400, "1Missing one or more fields.");
		req.body.data.subtype ||= 0;

		res.setHeader("Content-Type", "application/json");
		res.json({
			status: "ok",
			data: {
				xml: listAssets(req.body.data)
			}
		});
	})
	.route(
		"*",
		["/goapi/getAsset/", /\/assets\/([\S]+)/],
		async (req, res) => {
			const url = req.parsedUrl.pathname;
			const id = url.charAt(1) == "a" ?
				req.matches[1] :
				req.body.assetId || "go away";

			try {
				const readStream = Asset.load(id);
				res.setHeader("Content-Type", mime.contentType(id));
				readStream.pipe(res);
			} catch (e) {
				res.status(404).end();
			}
		}
	)
	.route("POST", "/api/asset/upload", async (req, res) => {
		const file = req.files.import;
		res.assert(
			file,
			req.body.type,
			req.body.subtype,
			400,
			'{status:"error"}'
		);
		// get the filename and extension
		const origName = file.originalFilename;
		const dotIn = origName.lastIndexOf(".");
		const filename = origName.substring(0, dotIn);
		let ext = origName.substring(dotIn + 1);
		// read the file
		const path = file.filepath;

		let info = {
			type: req.body.type,
			subtype: req.body.subtype,
			title: req.body.name || filename,
		}, stream;

		if (
			info.type != "bg" ||
			info.subtype != "video"
		) {
			stream = fs.createReadStream(path);
			stream.pause();
		}
		switch (info.type) {
			case "sound": {
				ext = "mp3";
				info.duration = await rFileUtil.mp3Duration(path);
				info.downloadtype = "progressive";
				break;
			}

			case "bg" : {
				stream = await rFileUtil.resizeImage(path, 550, 354);
				stream.pause();
				break;
			}

			case "prop": {
				let { ptype } = req.body;
				// verify the prop type
				switch (ptype) {
					case "placeable":
					case "wearable":
					case "holdable":
						break;
					default: ptype = "placeable";
				}

			}

			default: {
				
			}
		}

		// save asset
		info.file = await Asset.save(stream, ext, info);
		// ...
		// stuff for the lvm
		info.enc_asset_id = info.file;

		res.json({
			status: "ok", 
			data: info
		});
	});

module.exports = group;
