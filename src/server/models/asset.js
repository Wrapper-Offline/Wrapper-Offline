const fs = require("fs");
const path = require("path");
const database = require("../../data/database.js");

/**
 * @typedef {Object} Sound
 * @property {"sound"} type
 * @property {"bgmusic" | "soundeffect" | "voiceover" | "tts"} subtype
 * @property {string} title
 * @property {number} duration
 * @property {string} id
 */
/**
 * @typedef {Object} Background
 * @property {"bg"} type
 * @property {"0"} subtype
 * @property {string} title
 * @property {string} id
 */
/**
 * @typedef {Object} Watermark
 * @property {"watermark"} type
 * @property {"0"} subtype
 * @property {string} title
 * @property {string} id
 */
/**
 * @typedef {Object} Prop
 * @property {"prop"} type
 * @property {"0"} subtype
 * @property {"placeable" | "headable" | "holdable" | "wearable"} ptype
 * @property {string} title
 * @property {string} id
 */
/**
 * @typedef {Object} Video
 * @property {"prop"} type
 * @property {"video"} subtype
 * @property {string} title
 * @property {number} duration
 * @property {number} width
 * @property {number} height
 * @property {string} id
 */

/**
 * @typedef {Sound | Background | Watermark | Prop | Video | import("./char.js").Char} Asset
 */

const header = process.env.XML_HEADER;

module.exports = class AssetModel {
	static folder = path.join(__dirname, "../../../", process.env.ASSET_FOLDER);

	/**
	 * Deletes an asset.
	 * @param {string} id 
	 */
	static delete(id) {
		const asset = database.instance.get("assets", id);
		if (!asset) {
			throw "404";
		}
		database.instance.delete("assets", id);

		const { type, subtype } = asset.data;
		// char ids don't have a file extension so we'll need to add it
		if (type == "char") id += ".xml";
		fs.unlinkSync(path.join(this.folder, id));

		// delete video and char thumbnails
		if (
			type == "char" ||
			subtype == "video"
		) {
			const thumbId = id.slice(0, -3) + "png";
			fs.unlinkSync(path.join(this.folder, thumbId));
		}
	};

	/**
	 * @overload
	 * @param {string} id 
	 * @param {false} returnBuffer
	 * @returns {fs.ReadStream}
	 */
	/**
	 * @overload
	 * @param {string} id 
	 * @param {true} returnBuffer
	 * @returns {Buffer}
	 */
	/**
	 * Returns a buffer or stream. Throws an error if the asset doesn't exist.
	 */
	static load(id, returnBuffer = false) {
		if (!this.exists(id)) {
			throw "404";
		}

		const filepath = path.join(this.folder, id);
		let data;
		if (returnBuffer) {
			data = fs.readFileSync(filepath);
		} else {
			data = fs.createReadStream(filepath);
		}
		return data;
	};

	/**
	 * @overload
	 * @param {object} filters object containing all properties an asset object should have
	 * @param {false} returnXml
	 * @returns {Asset[]}
	 */
	/**
	 * @overload
	 * @param {object} filters 
	 * @param {true} returnXml
	 * @returns {string}
	 */
	/**
	 * returns an array of assets 
	 * @param filters object containing all properties an asset object should have
	 * @param returnXml if true, returns a ugc theme xml instead of an array of `Asset`s
	 */
	static list(param1, param2) {
		let filters, returnXml;
		if (typeof param1 == "boolean") {
			filters = null;
			returnXml = param1;
		} else if (typeof param1 == "object") {
			filters = param1;
			if (typeof param2 == "boolean") {
				returnXml = param2;
			}
		}

		const files = database.instance.select("assets", filters);
		if (returnXml) {
			return `${
				header
			}<ugc more="0">${
				files.map(this.meta2Xml).join("")
			}</ugc>`;
		}
		return files;
	};

	/**
	 * returns an `Asset` object
	 * @param {string} id
	 * @returns {Asset}
	 */
	static getInfo(id) {
		if (!this.exists(id)) {
			throw "404";
		}
		return database.instance.get("assets", id);
	}

	/**
	 * updates asset info
	 * @param {string} id 
	 * @param {object} info 
	 */
	static updateInfo(id, info) {
		if (!this.exists(id)) {
			throw "404";
		}
		database.instance.update("assets", id, info)
	}

	/**
	 * checks if an asset exists by its id
	 * @param {string} id 
	 */
	static exists(id) {
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		return exists;
	};

	/**
	 * converts an asset or starter object to a theme xml node
	 * @param {Asset | import("./movie.js").Movie} v asset or starter object
	 * @returns theme xml node with the asset information
	 */
	static meta2Xml(v) {
		// sanitize stuff
		v.title = (v.title || "").replace(/"/g, "&quot;");

		let xml;
		switch (v.type) {
			case "char": {
				xml = `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.title || "Untitled"}" cc_theme_id="${v.themeId}" thumbnail_url="/assets/${v.id}.png" copyable="Y"><tags>${v.tags || ""}</tags></char>`;
				break;
			}
			case "bg": {
				xml = `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/assets/${v.id}"/>`
				break;
			}
			case "movie": {
				xml = `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="${v.sceneCount}" title="${v.title}" thumbnail_url="/file/movie/thumb/${v.id}"><tags></tags></movie>`;
				break;
			}
			case "prop": {
				if (v.subtype == "video") {
					xml = `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" placeable="1" facing="left" width="${v.width}" height="${v.height}" asset_url="/assets/${v.id}" thumbnail_url="/assets/${v.id.slice(0, -3) + "png"}"/>`;
				} else {
					xml = `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" ${v.ptype}="1" facing="left" width="0" height="0" asset_url="/assets/${v.id}"/>`;
				}
				break;
			}
			case "sound": {
				xml = `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`;
				break;
			}
			default: {
				throw new Error("Asset type is invalid.");
			}
		}
		return xml;
	};

	/**
	 * Saves an asset.
	 * @param {fs.ReadStream | Buffer | string} data read stream, buffer, or file path
	 * @param {string} idOrExt asset file extension, or a predetermined id including the ext
	 * @param {Asset} info 
	 * @returns {Promise<string>}
	 */
	static save(data, idOrExt, info) {
		return new Promise((res, rej) => {
			if (idOrExt.includes(".")) {
				info.id = idOrExt;
			} else {
				info.id = `${database.generateId()}.${idOrExt}`;
			}
			database.instance.insert("assets", info)

			let writeStream = fs.createWriteStream(path.join(this.folder, info.id));
			if (Buffer.isBuffer(data)) { // 
				writeStream.write(data, (e) => {
					if (e && e != null) return rej(e);
					res(info.id);
				});
			} else { // stream
				if (typeof data == "string") { // file path
					data = fs.createReadStream(data);
					data.pause();
				}
				data.resume();
				data.pipe(writeStream);
				// wait for the stream to end
				data.on("end", () => res(info.id));
			}
		});
	};
};
