/**
 * character api
 */
// modules
const fs = require("fs");
const path = require("path");
// vars
const baseUrl = process.env.CHAR_BASE_URL;
const folder = path.join(__dirname, "../", process.env.ASSET_FOLDER);
// stuff
const database = require("../data/database"), DB = new database();
const fUtil = require("../fileUtil");
const get = require("../request/get");

module.exports = {
	/**
	 * Looks for a theme in a character XML.
	 * @param {Buffer} buffer
	 * @returns {string}
	 */
	getTheme(buffer) {
		const beg = buffer.indexOf(`theme_id="`) + 10;
		const end = buffer.indexOf(`"`, beg);
		return buffer.slice(beg, end).toString();
	},

	/**
	 * Tries to find a character in the _SAVED folder. If there's no match, it tries to find it in the character dump.
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	async load(cId) {
		try {
			try { // custom characters
				return fs.readFileSync(path.join(folder, `${cId}.xml`));
			} catch (err) { // stock characters
				const nId = (cId.slice(0, -3) + "000").padStart(9, 0);
				const chars = fs.readFileSync(`${baseUrl}/${nId}.txt`);

				var line = chars
					.toString("utf8")
					.split("\n")
					.find(v => v.substring(0, 3) == cId.slice(-3));
				if (line) return Buffer.from(line.substring(3));
				else throw new Error("Character not found.");
			}	
		} catch (err) {
			throw new Error("Character not found.");
		}
	},

	/**
	 * Saves the character and its metadata.
	 * @param {Buffer} buf 
	 * @param {Buffer} thumb 
	 * @param {object} param1 
	 * @returns {string}
	 */
	save(buf, { type, subtype, title, tId }) {
		// save asset info
		const cId = fUtil.generateId();
		const db = DB.get();
		db.assets.unshift({ // base info, can be modified by the user later
			id: cId,
			enc_asset_id: cId,
			themeId: tId,
			type: type,
			subtype: subtype,
			title: title,
			tags: ""
		});
		DB.save(db);
		// fix handheld props for freeaction themes
		if (this.isFA(tId)) {
			const end = buf.indexOf(">", buf.indexOf("<cc_char"));
			const newChar = Buffer.concat([
				buf.slice(0, end),
				Buffer.from(" version=\"2.0\""),
				buf.slice(end)
			]);
			buf = newChar;
		}
		// save the file
		fs.writeFileSync(path.join(folder, `${cId}.xml`), buf);
		return cId;
	},

	saveThumb(cId, thumb) {
		fs.writeFileSync(path.join(folder, `${cId}.png`), thumb);
		return cId;
	},

	isFA(themeId) {
		switch (themeId) {
			case "family":
				return false;
		}
		return true;
	}
}