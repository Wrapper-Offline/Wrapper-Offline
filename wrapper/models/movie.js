const fs = require("fs");
const nodezip = require("node-zip");
const path = require("path");
const database = require("../../data/database"), DB = new database();
const stringUtil = require("../utils/string.util");
const Parse = require("../utils/movieParser.util");
const folder = path.join(__dirname, "../../", process.env.SAVED_FOLDER);

module.exports = {
	/**
	 * deletes a movie do i really have to explain this to you
	 * @param {string} id 
	 * @return {Promise<{status: number} | void>}
	 */
	delete(id) {
		return new Promise((res, rej) => {
			if (DB.get("movies", id)) {
				DB.delete("movies", id);
			} else if (DB.select("assets", {
				id: id,
				type: "movie"
			}).length > 0) {
				DB.delete("assets", id);
			} else {
				return rej({ status: 404 });
			}
			fs.unlinkSync(path.join(folder, id + ".xml"));
			fs.unlinkSync(path.join(folder, id + ".png"));
			res();
		});
	},

	/**
	 * Packs a movie into a zip to be loaded by the video maker. :3 btw
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	async packMovie(id) {
		if (!this.exists(id)) {
			throw { status: 404 };
		} 
		const filepath = path.join(folder, id);
		const xml = fs.readFileSync(filepath + ".xml");
		const thumbnail = fs.readFileSync(filepath + ".png");
		const zipped = await Parse.pack(xml, thumbnail);
		return zipped;
	},

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
	async extractAudioTimes(id) {
		if (!this.exists(id)) {
			throw { status: 404 };
		}
		const filepath = path.join(folder, `${id}.xml`);
		const xml = fs.readFileSync(filepath);
		const audio = await Parse.extractAudioTimes(xml);
		return audio;
	},

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
	async extractMeta(id) {
		if (!this.exists(id)) {
			throw { status: 404 };
		}

		const filepath = path.join(folder, `${id}.xml`);
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
	},

	/**
	 * what do you think
	 * @param {Buffer} xml the movie xml
	 * @param {Buffer} thumb movie thumbnail in .png format
	 * @param {string} id movie id, if overwriting an old one
	 * @param {boolean} saveAsStarter
	 * @returns {Promise<string>}
	 */
	async save(xml, thumbnail, id, saveAsStarter) {
		return new Promise((res, rej) => {
			const newMovie = typeof id == "undefined" || id.length == 0;
			if (!newMovie && !this.exists(id)) {
				return rej({ status: 404 });
			}
			id ||= stringUtil.generateId();

			// save the thumbnail on manual saves
			if (typeof thumbnail !== "undefined") {
				fs.writeFileSync(path.join(folder, id + ".png"), thumbnail);
			}
			fs.writeFileSync(path.join(folder, id + ".xml"), xml);

			this.extractMeta(id).then((meta) => {
				let into;
				const info = {
					id: id,
					duration: meta.durationString,
					date: meta.date,
					title: meta.title,
					sceneCount: meta.sceneCount,
				}
				if (
					(newMovie && saveAsStarter) ||
					DB.select("assets", {
						id: id,
						type: "movie"
					}).length > 0
				) {
					info.type = "movie";
					into = "assets";
				} else {
					into = "movies";
				}
				if (!DB.update(into, id, info)) {
					console.log("Models.movie#save: Inserting movie into database...");
					DB.insert(into, info);
				}
				res(id);
			});
		});
	},

	/**
	 * checks if a movie exists
	 * @param {string} id
	 * @returns {boolean}
	 */
	exists(id) {
		if (
			!DB.get("movies", id) &&
			DB.select("assets", {
				id: id,
				type: "movie"
			}).length == 0
		) {
			return false;
		}
		return true;
	},

	/**
	 * Returns a stream of a movie thumbnail.
	 * @param {string} id 
	 * @returns {fs.readStream}
	 */
	thumb(id) {
		// look for match in folder
		const filepath = path.join(folder, `${id}.png`);
		if (fs.existsSync(filepath)) {
			const readStream = fs.createReadStream(filepath);
			return readStream;
		} else {
			throw new Error("Movie doesn't exist.");
		}
	},

	/**
	 * unpacks a movie zip
	 * @param {Buffer} body zip containing the movie and its assets
	 * @returns {Promise<string>}
	 */
	upload(body, isStarter) {
		return new Promise(async (res, rej) => {
			const id = stringUtil.generateId();
			const [xml, thumb] = await Parse.unpack(body);

			fs.writeFileSync(path.join(folder, `${id}.xml`), xml);
			fs.writeFileSync(path.join(folder, `${id}.png`), thumb);
			this.extractMeta(id).then((meta) => {
				let type;
				const info = {
					id,
					duration: meta.durationString,
					date: meta.date,
					title: meta.title,
					sceneCount: meta.sceneCount,
				}
				if (isStarter) {
					info.type = "movie";
					type = "assets";
				} else {
					type = "movies";
				}

				DB.insert(type, info);
				res(id);
			});
		});
	}
};
