/**
 * movie api
 */
// module
const fs = require("fs");
const nodezip = require("node-zip");
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.SAVED_FOLDER);
// stuff
const fUtil = require("../fileUtil");
const parse = require("./parse");

module.exports = {
	loadZip(mId) {
		return new Promise((res, rej) => {
			let filePath = `${folder}/${mId}.xml`;
			if (!fs.existsSync(filePath)) rej("Movie doesn't exist.");

			const buffer = fs.readFileSync(filePath);
			parse.packXml(buffer, mId).then(v => res(v));
		});
	},
	loadXml(movieId) {
		return new Promise((res, rej) => {
			const i = movieId.indexOf('-');
			const prefix = movieId.substr(0, i);
			const suffix = movieId.substr(i + 1);
			switch (prefix) {
				case 'm': {
					const fn = fUtil.getFileIndex('movie-', '.xml', suffix);
					fs.existsSync(fn) ? res(fs.readFileSync(fn)) : rej();
					break;
				}
				default: rej();
			}
		});
	},
	thumb(mId) {
		return new Promise((res, rej) => {
			const fn = `${folder}/${mId}.png`;
			res(fs.readFileSync(fn));
		});
	},
	list() {
		const array = [];
		fs.readdirSync(folder).forEach(fn => {
			if (!fn.includes(".xml")) return;
			const mId = fn.substring(0, fn.length - 4);
			const movie = fs.existsSync(`${folder}/${mId}.xml`);
			const thumb = fs.existsSync(`${folder}/${mId}.png`);
			if (movie && thumb) array.push(mId);
		});
		return array;
	},
	async meta(mId) {
		const fn = `${folder}/${mId}.xml`;

		const fd = fs.openSync(fn, 'r');
		const buffer = Buffer.alloc(256);
		fs.readSync(fd, buffer, 0, 256, 0);
		const begTitle = buffer.indexOf('<title>') + 16;
		const endTitle = buffer.indexOf(']]></title>');
		const title = buffer.slice(begTitle, endTitle).toString().trim();

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
			id: mId,
		};
	},

	/**
	 * Extracts the movie XML from a zip and saves it.
	 * @param {Buffer} body 
	 * @param {Buffer} thumb 
	 * @param {string} mId 
	 * @returns {Promise<string>}
	 */
	async save(body, thumb, mId = fUtil.generateId()) {
		// save the thumbnail on manual saves
		if (thumb) fs.writeFileSync(path.join(folder, `${mId}.png`), thumb);
		// extract the movie xml and save it
		const zip = nodezip.unzip(body);
		const xmlStream = zip["movie.xml"].toReadStream();

		let writeStream = fs.createWriteStream(path.join(folder, `${mId}.xml`));
		xmlStream.on("data", b => writeStream.write(b));
		xmlStream.on("end", async () => {
			writeStream.close();
			return mId;
		});
	},
}