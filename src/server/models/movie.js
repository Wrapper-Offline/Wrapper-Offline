const fs = require("fs");
const path = require("path");
const database = require("../../data/database.js");
const Parse = require("../../utils/movieParser.js");

/**
 * @typedef {Object} Movie
 * @property {string} duration
 * @property {string} date
 * @property {string} title
 * @property {number} sceneCount
 * @property {?string} watermark
 * @property {string} id
 * @property {?"movie"} type
 */

module.exports = class MovieModel {
	static folder = path.join(__dirname, "../../../", process.env.SAVED_FOLDER);

	/**
	 * deletes a movie do i really have to explain this to you
	 * @param {string} id 
	 * @returns {Promise<void>}
	 */
	static delete(id) {
		return new Promise((res, rej) => {
			// if movie delete from movies, if starter delete from assets
			if (database.instance.get("movies", id)) {
				database.instance.delete("movies", id);
			} else if (database.instance.select("assets", {
				id: id,
				type: "movie"
			}).length > 0) {
				database.instance.delete("assets", id);
			} else {
				return rej("404");
			}

			fs.unlinkSync(path.join(this.folder, id + ".xml"));
			fs.unlinkSync(path.join(this.folder, id + ".png"));
			res();
		});
	}

	/**
	 * packs a movie into a zip to be loaded by the videomaker
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	static async packMovie(id) {
		if (!this.exists(id)) {
			throw "404";
		} 
		const filepath = path.join(this.folder, id);
		const xml = fs.readFileSync(filepath + ".xml");
		const thumbnail = fs.readFileSync(filepath + ".png");
		const zipped = await Parse.pack(xml, thumbnail);
		return zipped;
	}

	/*
	extraction
	*/

	/**
	 * @param {string} id 
	 * @returns {Promise<{
	 *  filepath: string,
	 *  start: number,
	 *  stop: number,
	 *  trimStart: number,
	 *  trimEnd: number,
	 *  fadeIn: {
	 *   duration: number;
	 *   vol: number;
	 *  },
	 *  fadeOut: {
	 *   duration: number;
	 *   vol: number;
	 *  }
	 * }[]>}
	 */
	static async extractAudioTimes(id) {
		if (!this.exists(id)) {
			throw "404";
		}
		const filepath = path.join(this.folder, `${id}.xml`);
		const xml = fs.readFileSync(filepath);
		const audio = await Parse.extractAudioTimes(xml);
		return audio;
	}

	/**
	 * Gets movie metadata from an XML.
	 * @param {string} id the movie id
	 * @returns {{
	 * 	date: Date,
	 *  durationString: string,
	 * 	duration: number,
	 *  sceneCount?: count,
	 * 	title: string,
	 * 	id: string
	 * }} 
	 */
	static async extractMeta(id) {
		const filepath = path.join(this.folder, `${id}.xml`);
		if (!fs.existsSync(filepath)) {
			throw "404";
		}
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
		let pos = buffer.indexOf('<scene id=');
		while (pos > -1) {
			count++;
			pos = buffer.indexOf('<scene id=', pos + 10);
		}

		return {
			id,
			duration,
			title,
			date: fs.statSync(filepath).mtime,
			durationString: durationStr,
			sceneCount: count,
		};
	}

	/**
	 * what do you think
	 * @param {Buffer} xml the movie xml
	 * @param {Buffer} thumb movie thumbnail in .png format
	 * @param {string} id movie id, if overwriting an old one
	 * @param {boolean} saveAsStarter
	 * @returns {Promise<string>}
	 */
	static async save(xml, thumbnail, id, saveAsStarter) {
		return new Promise((res, rej) => {
			const newMovie = typeof id == "undefined" || id.length == 0;
			if (!newMovie && !this.exists(id)) {
				return rej("404");
			}
			id ||= database.generateId();

			// save the thumbnail on manual saves
			if (typeof thumbnail !== "undefined") {
				fs.writeFileSync(path.join(this.folder, id + ".png"), thumbnail);
			}
			fs.writeFileSync(path.join(this.folder, id + ".xml"), xml);

			this.extractMeta(id).then((meta) => {
				// meoww x3
				let dbCat;
				const info = {
					id: id,
					duration: meta.durationString,
					date: meta.date.toISOString(),
					title: meta.title,
					sceneCount: meta.sceneCount,
				}
				if (
					// new starter
					(newMovie && saveAsStarter) ||
					database.instance.select("assets", {
						id: id,
						type: "movie"
					}).length > 0
				) {
					info.type = "movie";
					dbCat = "assets";
				} else {
					dbCat = "movies";
				}
				if (!database.instance.update(dbCat, id, info)) {
					console.log("Models.movie#save: Inserting movie into database...");
					database.instance.insert(dbCat, info);
				}
				res(id);
			});
		});
	}

	/**
	 * checks if a movie exists
	 * @param {string} id
	 */
	static exists(id) {
		if (
			!database.instance.get("movies", id) &&
			database.instance.select("assets", {
				id: id,
				type: "movie"
			}).length <= 0
		) {
			return false;
		}
		return true;
	}

	/**
	 * Returns a stream of a movie thumbnail.
	 * @param {string} id 
	 */
	static thumb(id) {
		// look for match in folder
		const filepath = path.join(this.folder, `${id}.png`);
		if (fs.existsSync(filepath)) {
			const readStream = fs.createReadStream(filepath);
			return readStream;
		} else {
			throw "404";
		}
	}

	/**
	 * unpacks a movie zip
	 * @param {Buffer} body zip containing the movie and its assets
	 * @param {?boolean} isStarter is the movie being uploaded as a starter
	 * @returns {Promise<string>}
	 */
	static upload(body, isStarter = false) {
		return new Promise(async (res, rej) => {
			const id = database.generateId();
			const [xml, thumb] = await Parse.unpack(body);

			fs.writeFileSync(path.join(this.folder, `${id}.xml`), xml);
			fs.writeFileSync(path.join(this.folder, `${id}.png`), thumb);
			this.extractMeta(id).then((meta) => {
				let type;
				const info = {
					id,
					duration: meta.durationString,
					date: meta.date.toISOString(),
					title: meta.title,
					sceneCount: meta.sceneCount,
				}
				if (isStarter) {
					info.type = "movie";
					type = "assets";
				} else {
					type = "movies";
				}

				database.instance.insert(type, info);
				res(id);
			});
		});
	}
};
