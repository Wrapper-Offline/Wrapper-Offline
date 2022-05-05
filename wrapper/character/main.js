// modules
const fs = require("fs");
const path = require("path");
// vars
const baseUrl = process.env.CHAR_BASE_URL;
const folder = path.join(__dirname, "/../", process.env.ASSET_FOLDER);
// stuff
const database = require("../data/database"), DB = new database();
const fUtil = require("../fileUtil");
const get = require("../request/get");

module.exports = {
	/**
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	getTheme(buffer) {
		console.log(buffer);
		const beg = buffer.indexOf(`theme_id="`) + 10;
		const end = buffer.indexOf(`"`, beg);
		return buffer.slice(beg, end).toString();
	},
	list(tId) { // very simple thanks to the database
		const aList = DB.get().assets.filter(i => i.type == "char" && i.themeId == tId);
		return aList;
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	async load(aId) {
		try {
			try { // custom characters
				return Buffer.from(fs.readFileSync(`${folder}/${aId}.xml`));
			} catch (err) { // stock characters
				const nId = (aId.slice(0, -3) + "000").padStart(9, 0);
				const chars = await get(`${baseUrl}/${nId}.txt`);

				var line = chars
					.toString("utf8")
					.split("\n")
					.find(v => v.substring(0, 3) == aId.slice(-3));
				if (line) return Buffer.from(line.substring(3));
				else throw "Character not found.";
			}	
		} catch (err) {
			throw "Character not found."
		}
	},
	/** 
	 * @param {Buffer} buf
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	save(buf, { type, subtype, title, ext, tId }) {
		// save asset info
		const id = fUtil.generateId();
		const db = DB.get();
		db.assets.unshift({ // base info, can be modified by the user later
			id: id,
			enc_asset_id: id,
			themeId: tId,
			type: type,
			subtype: subtype,
			title: title,
			published: "",
			share: {
				type: "none"
			},
			tags: "",
			file: `${id}.${ext}`
		});
		DB.save(db);
		// save the file
		fs.writeFileSync(`${folder}/${id}.${ext}`, buf);
		return id;
	},
	/** 
	 * @param {Buffer} buf
	 * @param {string} id
	 * @returns {string}
	 */
	saveThumb(buf, id) {
		// save the file
		fs.writeFileSync(`${folder}/${id}.png`, buf);
		return id;
	},
}