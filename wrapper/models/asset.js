/**
 * asset api
 */
// modules
const fs = require("fs");
const path = require("path");
// vars
const folder = path.join(__dirname, "../../", process.env.ASSET_FOLDER);
// stuff
const database = require("../../data/database"), DB = new database();
const fUtil = require("../../utils/fileUtil");

module.exports = {
	/**
	 * Deletes an asset.
	 * @param {string} id 
	 */
	delete(id) {
		const { type, subtype } = DB.get("assets", id).data;
		DB.delete("assets", id);

		if (type == "char") id += ".xml";
		fs.unlinkSync(path.join(folder, id));

		// delete video and char thumbnails
		if (
			type == "char" ||
			subtype == "video"
		) {
			const thumbId = id.slice(0, -3) + "png";
			fs.unlinkSync(path.join(folder, thumbId));
		}
	},

	/**
	 * Returns a buffer or stream. Throws an error if the asset doesn't exist.
	 * @param {string} id 
	 * @param {boolean} returnBuffer
	 * @returns {fs.ReadStream | Buffer}
	 */
	load(id, returnBuffer = false) {
		if (this.exists(id)) {
			const filepath = path.join(folder, id);
			let data;
			if (returnBuffer) {
				data = fs.readFileSync(filepath);
			} else {
				data = fs.createReadStream(filepath);
			}

			return data;
		} else {
			throw new Error("Asset doesn't exist.");
		}
	},

	/**
	 * Checks if the file exists.
	 * @param {string} id 
	 * @returns {boolean}
	 */
	exists(id) {
		const filepath = path.join(folder, id);
		const exists = fs.existsSync(filepath);
		return exists;
	},

	/**
	 * Converts an object to a metadata XML.
	 * @param {any[]} v 
	 * @returns {string}
	 */
	meta2Xml(v) {
		// sanitize stuff
		v.title = (v.title || "").replace(/"/g, "&quot;");

		let xml;
		switch (v.type) {
			case "char": {
				xml = `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.title || "Untitled"}" cc_theme_id="${v.themeId}" thumbnail_url="/assets/${v.id}.png" copyable="Y"><tags>${v.tags || ""}</tags></char>`;
				break;
			} case "bg": {
				xml = `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/assets/${v.id}"/>`
				break;
			} case "movie": {
				xml = `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="${v.sceneCount}" title="${v.title}" thumbnail_url="/file/movie/thumb/${v.id}"><tags></tags></movie>`;
				break;
			} case "prop": {
				if (v.subtype == "video") {
					xml = `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" placeable="1" facing="left" width="${v.width}" height="${v.height}" asset_url="/assets/${v.id}" thumbnail_url="/assets/${v.id.slice(0, -3) + "png"}"/>`;
				} else {
					xml = `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" ${v.ptype}="1" facing="left" width="0" height="0" asset_url="/assets/${v.id}"/>`;
				}
				break;
			} case "sound": {
				xml = `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`;
				break;
			}
		}
		return xml;
	},

	/**
	 * Saves an asset.
	 * @param {fs.ReadStream | Buffer | string} data 
	 * @param {string} ext
	 * @param {object} info 
	 * @returns {string}
	 */
	save(data, ext, info) {
		return new Promise((res, rej) => {
			info.id = `${fUtil.generateId()}.${ext}`;
			DB.insert("assets", info)
			// save the file
			let writeStream = fs.createWriteStream(path.join(folder, info.id));

			if (Buffer.isBuffer(data)) {
				writeStream.write(data, (e) => {
					if (e && e != null) rej(e);
					res(info.id);
				});
			} else {
				if (typeof data == "string") {
					// it's a file path
					data = fs.createReadStream(data);
					data.pause();
				}
				data.resume();
				data.pipe(writeStream);
				// wait for the stream to end
				data.on("end", () => res(info.id));
			}
		});
	}
};