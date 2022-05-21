/**
 * asset api
 */
// module
const fs = require("fs");
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.ASSET_FOLDER);
// stuff
const database = require("../data/database"), DB = new database();
const fUtil = require("../fileUtil");

module.exports = {
	/**
	 * Deletes an asset.
	 * @param {string} aId 
	 */
	delete(aId) {
		// remove info from database
		const db = DB.get();
		const index = this.find(aId, { getIndex : true});
		db.assets.splice(index, 1);
		DB.save(db);
		// find file by id and delete it
		const match = fs.readdirSync(folder)
			.find(file => file.includes(aId));
		if (match) fs.readFileSync(path.join(folder, match));

	},

	/**
	 * Gets a list of assets from the database, and filters it.
	 * @param {object} filters
	 * @returns {object[]}
	 */
	list(filters) { // very simple thanks to the database
		let filtered = DB.get().assets.filter(i => {
			for (const [key, value] of Object.entries(filters)) {
				if (i[key] && i[key] != value) return false;
			}
			return true;
		});
		return filtered;
	},

	/**
	 * Looks for a match in the _ASSETS folder.
	 * If there's no match found, it returns null.
	 * @param {string} wfId 
	 * @returns {Buffer | null}
	 */
	load(aId) { // look for match in folder
		const match = fs.readdirSync(folder)
			.find(file => file.includes(aId));
		return match ? fs.readFileSync(path.join(folder, match)) : null;
	},

	/**
	 * Returns asset metadata from the database.
	 * @param {string} aId 
	 * @returns {object}
	 */
	meta(aId, { getIndex = false }) {
		const callback = i => i.id == aId;
		const meta = DB.get().assets[getIndex ? "findIndex" : "find"](callback);
		if (!meta) throw new Error("Asset doesn't exist.");
		return meta;
	},

	meta2Xml(v) {
		let xml;
		switch (v.type) {
			case "char": {
				xml = `<char id="${v.id}" enc_asset_id="${v.id}" name="Untitled" cc_theme_id="${v.themeId}" thumbnail_url="char_default.png" copyable="Y"><tags/></char>`;
				break;
			} case "bg": {
				xml = `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/assets/${v.id}"/>`
				break;
			} case "movie": {
				xml = `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="${v.sceneCount}" title="${v.title}" thumbnail_url="/file/movie/thumb/${v.id}"><tags></tags></movie>`;
				break;
			} case "prop": {
				if (v.subtype == "video") {
					xml = `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.file}"/>`;
				} else {
					xml = `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/assets/${v.id}"/>`;
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
	 * Saves the asset and its metadata.
	 * @param {Buffer} buf 
	 * @param {object} param1 
	 * @returns {string}
	 */
	save(buf, { type, subtype, title, duration, ext, tId }) {
		// save asset info
		const aId = fUtil.generateId();
		const db = DB.get();
		db.assets.unshift({ // base info, can be modified by the user later
			id: `${aId}.${ext}`,
			enc_asset_id: aId,
			themeId: tId,
			type: type,
			subtype: subtype,
			title: title,
			tags: "",
			duration: duration
		});
		DB.save(db);
		// save the file
		fs.writeFileSync(path.join(folder, `${aId}.${ext}`), buf);
		return aId;
	},

	/**
	 * Saves the asset and its metadata.
	 * @param {fs.ReadStream} fileStream 
	 * @param {object} param1 
	 * @returns {string}
	 */
	async saveStream(fileStream, { type, subtype, title, duration, ext, tId }) {
		// save asset info
		const aId = fUtil.generateId();
		const db = DB.get();
		db.assets.unshift({ // base info, can be modified by the user later
			id: `${aId}.${ext}`,
			enc_asset_id: aId,
			themeId: tId,
			type: type,
			subtype: subtype,
			title: title,
			tags: "",
			duration: duration
		});
		DB.save(db);
		// save the file
		console.log("STREAM NOW");
		//console.log(fileStream);
		let writeStream = fs.createWriteStream(path.join(folder, `${aId}.${ext}`));
		fileStream.resume();
		fileStream.on("data", b => writeStream.write(b));
		fileStream.on("end", async () => {
			writeStream.close();
			return aId;
		});
	},

	/**
	 * Updates an asset's metadata.
	 * It cannot replace the asset itself.
	 * @param {string} aId 
	 * @param {object} newMet 
	 * @returns {void}
	 */
	update(aId, newMet) {
		// set new info and save
		const db = DB.get();
		const met = this.meta(aId);
		Object.assign(met, newMet);
		DB.save(db);
	}
};