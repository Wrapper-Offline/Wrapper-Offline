/**
 * movie api
 */
// module
const fs = require("fs");
const nodezip = require("node-zip");
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.SAVED_FOLDER);
const base = Buffer.alloc(1, 0);
// stuff
const fUtil = require("../fileUtil");
const parse = require("./parse");

module.exports = {
	/**
	 * Not what you think it is.
	 * It's just a list of movie IDs.
	 * @returns {string[]}
	 */
	list() {
		const array = [];
		fs.readdirSync(folder).forEach(fn => {
			if (!fn.includes(".xml")) return;
			// check if the movie and thumbnail exists
			const mId = fn.substring(0, fn.length - 4);
			const movie = fs.existsSync(`${folder}/${mId}.xml`);
			const thumb = fs.existsSync(`${folder}/${mId}.png`);
			if (movie && thumb) array.push(mId);
		});
		return array;
	},

	/**
	 * Parses a saved movie for the LVM.
	 * @param {string} mId 
	 * @param {boolean} isGet 
	 * @returns {Buffer}
	 */
	async load(mId, isGet = true) {
		const filepath = path.join(folder, `${mId}.xml`);
		if (!fs.existsSync(filepath)) throw new Error("Movie doesn't exist.");

		const buffer = fs.readFileSync(filepath);
		const parsed = await parse(buffer);
		return isGet ? parsed : Buffer.concat([base, parsed]);
	},

	/**
	 * Gets movie metadata from an XML.
	 * @param {string} mId 
	 * @returns {{
	 * 	date: Date,
	 *  durationString: string,
	 * 	duration: number,
	 * 	title: string,
	 * 	id: string
	 * }} 
	 */
	async meta(mId) {
		const filepath = path.join(folder, `${mId}.xml`);
		const buffer = fs.readFileSync(filepath);
		const meta = buffer.slice(0, buffer.indexOf("</meta>")).toString().trim();

		// get the duration string
		const duration = Number.parseFloat(meta.betstring('duration="', '"'));
		const min = ('' + ~~(duration / 60)).padStart(2, '0');
		const sec = ('' + ~~(duration % 60)).padStart(2, '0');
		const durationStr = `${min}:${sec}`;

		return {
			date: fs.statSync(filepath).mtime,
			durationString: durationStr,
			duration: duration,
			title: meta.betstring("<title><![CDATA[", "]]>"),
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

	/**
	 * Looks for a match in the _SAVED folder.
	 * If there's no match found, it returns null.
	 * @param {string} wfId 
	 * @returns {Buffer | null}
	 */
	thumb(mId) { // look for match in folder
		const match = fs.readdirSync(folder)
			.find(file => file.includes(`${mId}.png`));
		return match ? fs.readFileSync(path.join(folder, match)) : null;
	},
}
