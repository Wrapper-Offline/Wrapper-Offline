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
const database = require("../data/database"), DB = new database();
const fUtil = require("../utils/fileUtil");
const parse = require("../models/parse");

module.exports = {
	/**
	 * Deletes a movie.
	 * @param {string} id 
	 */
	delete(id) {
		DB.delete("movies", id);

		// delete the actual file
		fs.unlinkSync(path.join(folder, `${id}.xml`));
		fs.unlinkSync(path.join(folder, `${id}.png`));
	},

	/**
	 * Parses a saved movie for the LVM.
	 * @param {string} mId 
	 * @param {boolean} isGet 
	 * @returns {Promise<Buffer>}
	 */
	async load(mId, isGet = true) {
		const filepath = path.join(folder, `${mId}.xml`);

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
	 *  sceneCount?: count,
	 * 	title: string,
	 * 	id: string
	 * }} 
	 */
	async meta(mId, getSc = false) {
		const filepath = path.join(folder, `${mId}.xml`);
		const buffer = fs.readFileSync(filepath);

		// title
		const title = buffer.subarray(
			buffer.indexOf("<title>") + 16,
			buffer.indexOf("]]></title>")
		).toString().trim();

		// get the duration string
		const durBeg = buffer.indexOf('duration="') + 10;
		const duration = Number.parseFloat(buffer.subarray(
			durBeg,
			buffer.indexOf('"', durBeg)
		).toString().trim());
		const min = ('' + ~~(duration / 60)).padStart(2, '0');
		const sec = ('' + ~~(duration % 60)).padStart(2, '0');
		const durationStr = `${min}:${sec}`;

		let count = 0;
		if (getSc) { // get the scene count
			let index = 0;
			while (buffer.indexOf('<scene id=', index) > -1) {
				count++;
				index += buffer.indexOf('<scene id=', index);
			}
		}

		return {
			duration,
			title,
			date: fs.statSync(filepath).mtime,
			durationString: durationStr,
			sceneCount: count,
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
	async save(body, thumb, id) {
		return new Promise((resolve, reject) => {
			id ||= fUtil.generateId();

			// save the thumbnail on manual saves
			if (thumb) {
				fs.writeFileSync(path.join(folder, `${id}.png`), thumb);
			}
			// extract the movie xml and save it
			const zip = nodezip.unzip(body);
			const xmlStream = zip["movie.xml"].toReadStream();

			let writeStream = fs.createWriteStream(path.join(folder, `${id}.xml`));
			xmlStream.on("data", b => writeStream.write(b));
			xmlStream.on("end", async () => {
				writeStream.close((e) => {
					if (e) throw e;

					this.meta(id, true).then((meta) => {
						const info = {
							id,
							duration: meta.durationString,
							date: meta.date,
							title: meta.title,
							sceneCount: meta.sceneCount,
						}
						try {
							DB.update("movies", id, info);
						} catch (e) {
							DB.insert("movies", info);
						}
						resolve(id);
					});
				});
			});
		});
	},

	/**
	 * Returns a stream of a movie thumbnail.
	 * @param {string} id 
	 * @returns {fs.readStream}
	 */
	thumb(id) { // look for match in folder
		const filepath = path.join(folder, `${id}.png`);
		if (fs.existsSync(filepath)) {
			const readStream = fs.createReadStream(filepath);
			return readStream;
		} else {
			throw new Error("Movie doesn't exist.");
		}
	},
}
