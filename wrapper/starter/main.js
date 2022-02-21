// Special Thanks To David's Tv Studio for helping us fix the code to store starters in the list. IK that you spent hours on that code. but i credited you lol.
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
					res('s-' + sId);
				});
			});
                });
	},
	thumb(movieId) {
		return new Promise((res, rej) => {
			if (!movieId.startsWith('s-')) return;
			const n = Number.parseInt(movieId.substr(2));
			const fn = fUtil.getFileIndex('starter-', '.png', n);
			isNaN(n) ? rej() : res(fs.readFileSync(fn));
		});
	},
	list() {
		const table = [];
		var ids = fUtil.getValidFileIndicies('starter-', '.xml');
		for (const i in ids) {
			var id = `s-${ids[i]}`;
			table.unshift({ id: id });
		}
		return table;
	},
	async meta(movieId) {
		if (!movieId.startsWith('s-')) return;
		const n = Number.parseInt(movieId.substr(2));
		const fn = fUtil.getFileIndex('starter-', '.xml', n);

		const fd = fs.openSync(fn, 'r');
		const buffer = Buffer.alloc(256);
		fs.readSync(fd, buffer, 0, 256, 0);
		const begTitle = buffer.indexOf('<title>') + 16;
		const endTitle = buffer.indexOf(']]></title>');
		const title = buffer.slice(begTitle, endTitle).toString().trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

		const begDuration = buffer.indexOf('duration="') + 10;
		const endDuration = buffer.indexOf('"', begDuration);
		const duration = Number.parseFloat(
			buffer.slice(begDuration, endDuration));
		const min = ('' + ~~(duration / 60)).padStart(2, '0');
		const sec = ('' + ~~(duration % 60)).padStart(2, '0');
		const durationStr = `${min}:${sec}`;

		fs.closeSync(fd);
		return {
			date: fs.statSync(fn).mtime,
			durationString: durationStr,
			duration: duration,
			title: title,
			id: movieId,
		};
	},
}
