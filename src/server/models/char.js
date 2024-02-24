const fs = require("fs");
const path = require("path");
const database = require("../../data/database.js");

/**
 * @typedef {Object} Char
 * @property {"char"} type
 * @property {0} subtype
 * @property {string} title
 * @property {string} tags
 * @property {string} themeId
 * @property {string} id
 */

module.exports = class CharModel {
	static folder = path.join(__dirname, "../../../", process.env.ASSET_FOLDER);
	static baseThumbUrl = path.join(__dirname, "../../../", process.env.CHAR_BASE_URL);

	/**
	 * Tries to find a character in the _SAVED folder. If there's no match, it tries to find it in the character dump.
	 * @param {string} id
	 * @returns {Buffer}
	 */
	static charXml(id) {
		try {
			try { // custom characters
				return fs.readFileSync(path.join(this.folder, `${id}.xml`));
			} catch (err) { // stock characters
				console.log(err);
				const nId = (id.slice(0, -3) + "000").padStart(9, "0");
				const chars = fs.readFileSync(path.join(this.baseThumbUrl, `${nId}.txt`));

				const line = chars
					.toString("utf8")
					.split("\n")
					.find((v) => v.substring(0, 3) == id.slice(-3));
				if (line) {
					return Buffer.from(line.substring(3));
				}
				throw "404";
			}	
		} catch (err) {
			console.log(err);
			throw "404";
		}
	}

	/**
	 * saves the character and its metadata
	 * @param {Buffer} buf a buffer of a character xml
	 * @param {Char} info character metadata
	 * @returns char id
	 */
	static save(xml, info) {
		// save asset info
		info.id ||= database.generateId();
		database.instance.insert("assets", info);

		// fix handheld props for v2 cc themes by inserting version="2.0"
		if (this.isFA(info.themeId) && xml.indexOf("version=\"2.0\"") == -1) {
			const end = xml.indexOf(">", xml.indexOf("<cc_char"));
			xml = Buffer.concat([
				xml.subarray(0, end),
				Buffer.from(" version=\"2.0\""),
				xml.subarray(end)
			]);
		}

		// save the file
		fs.writeFileSync(path.join(this.folder, `${info.id}.xml`), xml);
		return info.id;
	}

	/**
	 * saves a character thumbnail
	 * @param {string} id the character id
	 * @param {Buffer} thumb a thumbnail of the character in PNG format
	 */
	static saveThumb(id, thumb) {
		fs.writeFileSync(path.join(this.folder, `${id}.png`), thumb);
	}

	/**
	 * checks if a character exists
	 * @param {string} id 
	 */
	static exists(id) {
		try {
			this.charXml(id);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Looks for a theme in a character XML.
	 * @param {Buffer} charXml
	 * @returns theme id
	 */
	static getThemeId(charXml) {
		const beg = charXml.indexOf(`theme_id="`) + 10;
		const end = charXml.indexOf(`"`, beg);
		return charXml.subarray(beg, end).toString();
	}

	/**
	 * checks if a cc_theme is a freeaction theme
	 * @param {string} themeId 
	 */
	static isFA(themeId) {
		switch (themeId) {
			case "cctoonadventure":
			case "family":
				return false;
		}
		return true;
	}
};
