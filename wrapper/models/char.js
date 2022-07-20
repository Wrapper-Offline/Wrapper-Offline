/**
 * character api
 */
// modules
const fs = require("fs");
const path = require("path");
// vars
const baseUrl = path.join(__dirname, "../../", process.env.CHAR_BASE_URL);
const folder = path.join(__dirname, "../../", process.env.ASSET_FOLDER);
// stuff
const database = require("../../data/database"), DB = new database();
const fUtil = require("../../utils/fileUtil");

module.exports = {
	/**
	 * Tries to find a character in the _SAVED folder. If there's no match, it tries to find it in the character dump.
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	load(id) {
		try {
			try { // custom characters
				return fs.readFileSync(path.join(folder, `${id}.xml`));
			} catch (err) { // stock characters
				const nId = (id.slice(0, -3) + "000").padStart(9, 0);
				const chars = fs.readFileSync(path.join(baseUrl, `${nId}.txt`));

				const line = chars
					.toString("utf8")
					.split("\n")
					.find((v) => v.substring(0, 3) == id.slice(-3));
				if (line) {
					return Buffer.from(line.substring(3));
				}
				throw new Error("Character not found.");
			}	
		} catch (err) {
			throw new Error("Character not found.");
		}
	},

	/**
	 * saves the character and its metadata
	 * @param {Buffer} buf a buffer of a character xml
	 * @param {object} info character metadata, must contain type, subtype, title, and themeId
	 * @param {boolean} isV2 specifies if the 'version="2.0"' should be added to the xml
	 * @returns {string}
	 */
	save(buf, info, isV2 = false) {
		// save asset info
		info.id = fUtil.generateId();
		DB.insert("assets", info);

		// fix handheld props for freeaction themes
		if (this.isFA(info.themeId) && !isV2) {
			const end = buf.indexOf(">", buf.indexOf("<cc_char"));
			buf = Buffer.concat([
				buf.subarray(0, end),
				Buffer.from(" version=\"2.0\""),
				buf.subarray(end)
			]);
		}

		// save the file
		fs.writeFileSync(path.join(folder, `${info.id}.xml`), buf);
		return info.id;
	},

	/**
	 * saves a character thumbnail
	 * @param {string} id the character id
	 * @param {Buffer} thumb a thumbnail of the character in PNG format
	 * @returns {void}
	 */
	saveThumb(id, thumb) {
		fs.writeFileSync(path.join(folder, `${id}.png`), thumb);
		return;
	},

	/**
	 * Looks for a theme in a character XML.
	 * @param {Buffer} buffer
	 * @returns {string}
	 */
	getTheme(buffer) {
		const beg = buffer.indexOf(`theme_id="`) + 10;
		const end = buffer.indexOf(`"`, beg);
		return buffer.subarray(beg, end).toString();
	},

	/**
	 * Checks if a cc_theme is a freeaction theme.
	 * @param {string} themeId 
	 * @returns {boolean}
	 */
	isFA(themeId) {
		switch (themeId) {
			case "cctoonadventure":
			case "family":
				return false;
		}
		return true;
	}
}