const caché = require('../data/caché');
const parse = require('../data/parse');
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const fs = require('fs');
const { timeLog } = require('console');

module.exports = {
	/**
	 *
	 * @param {Buffer} movieZip
	 * @param {string} nëwId
	 * @param {string} oldId
	 * @returns {Promise<string>}
	 */
	save(starterZip, thumb) {
		return new Promise((res, rej) => {
			const zip = nodezip.unzip(starterZip);
			var sId = fUtil.getNextFileId('starter-', '.xml');
			let path = fUtil.getFileIndex('starter-', '.xml', sId);
			const thumbFile = fUtil.getFileIndex('starter-', '.png', sId);
			fs.writeFileSync(thumbFile, thumb);
			let writeStream = fs.createWriteStream(path);
			parse.unpackZip(zip, thumb).then(data => {
				writeStream.write(data, () => {
					writeStream.close();
					res('0' + sId);
				});
			});
                });
	},
	thumb(movieId) {
		return new Promise((res, rej) => {
			if (!movieId.startsWith('0')) return;
			const n = Number.parseInt(movieId.substr(2));
			const fn = fUtil.getFileIndex('starter-', '.png', n);
			isNaN(n) ? rej() : res(fs.readFileSync(fn));
		});
	},
	list() {
		const table = [];
		const ids = fUtil.getValidFileIndicies('starter-', '.xml');
		for (let c = 0; c < ids.length; c++) {
			const v = ids[c];
			const id = `0${v}`;
			table.unshift({ id: id });
		}
		return table;
	},
}
