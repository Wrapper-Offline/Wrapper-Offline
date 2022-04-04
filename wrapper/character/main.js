const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const fXml = process.env.FAILURE_XML;
const fUtil = require("../fileUtil");
const fw = process.env.FILE_WIDTH;
const get = require('../request/get');
const fs = require('fs');
const themes = {};
const database = require("../data/database"), DB = new database();
const folder = `${__dirname}/../${process.env.ASSET_FOLDER}`;

module.exports = {
	/**
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	getTheme(buffer) {
		return new Promise((res, rej) => {
			const beg = buffer.indexOf(`theme_id="`) + 10;
			const end = buffer.indexOf(`"`, beg);
			const theme = buffer.subarray(beg, end).toString();
			return theme;
		});
	},
	list(tId) { // very simple thanks to the database
		const aList = DB.get().assets.filter(i => i.type == "char" && i.themeId == tId);
		return aList;
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	load(id) {
		return new Promise((res, rej) => {
			try {
				res(fs.readFileSync(`${folder}/${id}.xml`));
			} catch (err) { // Blank prefix is left for compatibility purposes.
				console.log("Character doesn't exist. Loading as stock char...")
				const nId = Number.parseInt(id);
				const xmlSubId = nId % fw, fileId = nId - xmlSubId;
				const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
				const idPad0 = fUtil.padZero(fileId);
				const url = `${baseUrl}/${idPad0}.txt`;
				// check if txt exists
				if (fs.existsSync(`../server/characters/${idPad0}.txt`)) {
					get(url).then(b => {
						var line = b.toString('utf8').split('\n').find(v => v.substr(0, xNumWidth) == lnNum);
						line ? res(Buffer.from(line.substr(xNumWidth))) : rej(Buffer.from(fXml));
					}).catch(e => rej(Buffer.from(fXml)));
				} else rej()
			}	
		});
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