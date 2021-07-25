const cachéFolder = process.env.CACHÉ_FOLDER;
const fs = require('fs');

/**
 * @typedef {{[aId:string]:true,time:DataTransferItem}} vcType
 * @typedef {{[mId:string]:vcType}} cachéType
 * @type cachéType
 */
var caché = {}, size = 0;

fs.readdirSync(cachéFolder).forEach(v => {
	const index = v.indexOf('.');
	const mId = v.substr(0, index);
	const aId = v.substr(index + 1);

	const stored = caché[mId]
		|| (caché[mId] = {});
	switch (aId) {
		case 'time':
			stored.time = new Date();
			break;
		default:
			let path = `${cachéFolder}/${v}`;
			stored[aId] = fs.readFileSync(path);
	}
})

module.exports = {
	generateId(pre = '', suf = '', ct = {}) {
		var id;
		do id = `${pre}${('' + Math.random()).replace('.', '')}${suf}`;
		while (ct[id]);
		return id;
	},
	validAssetId(aId) {
		switch (aId) {
			case 'id':
			case 'time':
				return false;
			default:
				return true;
		}
	},
	save(mId, aId, buffer) {
		if (!this.validAssetId(aId)) return;
		/** @type {vcType} */
		const stored = (caché[mId] = caché[mId] || {});
		const path = `${cachéFolder}/${mId}.${aId}`;
		const oldSize = stored[aId] ? fs.readFileSync(path).length : 0;
		size += buffer.size - oldSize;
		stored[aId] = true;
		fs.writeFileSync(`${cachéFolder}/${mId}.${aId}`, buffer);
		return buffer;
	},
	saveTable(mId, buffers = {}) {
		const keys = Object.keys(buffers);
		if (!keys.length) caché[mId] = {};
		keys.forEach(aId =>
			this.save(mId, aId, buffers[aId]));
		caché[mId].time = new Date();
		return buffers;
	},
	/**
	 *
	 * @param {string} mId
	 * @returns {{[aId:string]:Buffer}}
	 */
	getTable(mId) {
		if (!caché[mId]) return {};

		const stored = {};
		for (let aId in caché[mId])
			stored[aId] = this.load(mId, aId);
		return stored;
	},
	/**
	 *
	 * @param {Buffer} buffer
	 * @param {string} mId
	 * @param {string} suf
	 */
	saveNew(buffer, mId, suf) {
		var t = caché[mId] = caché[mId] || {}, aId;
		this.save(mId, aId = this.generateId('', suf, t), buffer);
		return aId;
	},
	/**
	 * 
	 * @param {string} mId
	 * @param {string} aId 
	 */
	load(mId, aId) {
		if (!this.validAssetId(aId)) return;

		/** @type {vcType} */
		const stored = caché[mId];
		if (!stored) return null;

		const path = `${cachéFolder}/${mId}.${aId}`;
		stored.time = new Date();
		return stored[aId] ? fs.readFileSync(path) : null;
	},
	/**
	 * 
	 * @param {string} old
	 * @param {string} nëw 
	 */
	transfer(old, nëw) {
		if (nëw == old || !caché[old]) return;
		Object.keys(caché[nëw] = caché[old]).forEach(aId => {
			const oldP = `${cachéFolder}/${old}.${aId}`;
			const nëwP = `${cachéFolder}/${nëw}.${aId}`;
			fs.renameSync(oldP, nëwP);
		});
		delete caché[old];
	},
	/**
	 *
	 * @param {string} mId
	 * @param {boolean} removeMovie
	 */
	clear(mId, removeMovie = false) {
		const stored = caché[mId];
		Object.keys(stored).forEach(aId => size -= aId != 'time' ? stored[aId].length : 0);
		return removeMovie ? delete caché[mId] : caché[mId] = {};
	},
}