/**
 * asset api
 */
// modules
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
		const index = this.meta(aId, { getIndex: true });
		db.assets.splice(index, 1);
		DB.save(db);
		// find file by id and delete it
		const match = fs.readdirSync(folder)
			.filter(file => file.includes(aId));
		if (match) match.forEach(filename => 
			fs.unlinkSync(path.join(folder, filename)));
	},

	/**
	 * Gets a list of assets from the database, and filters it.
	 * @param {object} filters
	 * @returns {object[]}
	 */
	list(filters = {}) { // very simple thanks to the database
		let filtered = DB.get().assets.filter(i => {
			for (const [key, value] of Object.entries(filters)) {
				if (i[key] && i[key] != value) return false;
			}
			return true;
		});
		return filtered;
	},

	/**
	 * Looks for a match in the _ASSETS folder and returns the file buffer.
	 * If there's no match found, it returns null.
	 * @param {string} aId 
	 * @returns {Buffer | null}
	 */
	load(aId) { // look for match in folder
		const match = this.exists(aId);
		return match ? fs.readFileSync(path.join(folder, match)) : null;
	},

	/**
	 * Looks for a match in the _ASSETS folder.
	 * If there's no match found, it returns null.
	 * @param {string} aId 
	 * @returns {string | null}
	 */
	exists(aId) { // look for match in folder
		const match = fs.readdirSync(folder)
			.find(file => file.includes(aId));
		return match || false;
	},

	/**
	 * Returns asset metadata from the database.
	 * @param {string} aId 
	 * @returns {object}
	 */
	meta(aId, { getIndex } = {}) {
		const callback = i => i.id == aId;
		const meta = DB.get().assets[getIndex ? "findIndex" : "find"](callback);
		if (typeof meta != "number" && !meta) throw new Error("Asset doesn't exist.");
		return meta;
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
	 * Saves the asset and its metadata.
	 * @param {Buffer} buf 
	 * @param {object} meta 
	 * @returns {string}
	 */
	save(buf, meta) {
		// save asset info
		const aId = `${fUtil.generateId()}.${meta.ext}`;
		const db = DB.get();
		let newMeta = {
			id: aId,
			tags: ""
		};
		delete meta.ext;
		Object.assign(newMeta, meta);
		db.assets.unshift(newMeta);
		DB.save(db);
		// save the file
		fs.writeFileSync(path.join(folder, aId), buf);
		return aId;
	},

	/**
	 * Saves the asset and its metadata.
	 * @param {fs.ReadStream} readStream 
	 * @param {object} meta 
	 * @returns {string}
	 */
	saveStream(readStream, meta) {
		// save asset info
		const aId = `${fUtil.generateId()}.${meta.ext}`;
		const db = DB.get();
		let newMeta = {
			id: aId,
			tags: ""
		};
		delete meta.ext;
		Object.assign(newMeta, meta);
		db.assets.unshift(newMeta);
		DB.save(db);
		// save the file
		let writeStream = fs.createWriteStream(path.join(folder, aId));
		readStream.resume();
		readStream.pipe(writeStream);
		return aId;
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
		const index = this.meta(aId, { getIndex: true });
		Object.assign(db.assets[index], newMet);
		DB.save(db);
	}
};