import directories from "../../storage/directories";
import Database, { generateId } from "../../storage/database";
import fs from "fs";
import { join } from "path";
import Parse from "../utils/movieParser.js";
import Settings from "../../storage/settings";

export interface Movie {
	id: string,
	duration: string,
	date: string,
	title: string,
	sceneCount: number,
	watermark?: string,
	folder?: string,
};

export default class MovieModel {
	static folder = directories.saved;

	/**
	 * packs a movie into a zip to be loaded by the videomaker
	 * @param id movie id
	 * @throws {RangeError} movvie no etscisting
	 * @returns zip file containing the movie
	 */
	static async packMovie(id:string): Promise<Buffer> {
		if (!this.exists(id)) {
			throw new RangeError("THE MOVIE DOESN'T EXIST SHIT FOR BRAINS");
		} 
		const filepath = join(this.folder, id);
		const xml = fs.readFileSync(filepath + ".xml");
		const thumbPath = filepath + ".png";
		let thumbnail:Buffer | undefined;
		if (fs.existsSync(thumbPath)) {
			thumbnail = fs.readFileSync(thumbPath);
		}
		const zipped = await Parse.pack(xml, thumbnail);
		return zipped;
	}

	/**
	 * returns a movie thumbnail stream
	 * @param id movie id
	 * @throws {RangeError} the thumbnail file doesn't exist
	 */
	static thumb(id:string) {
		const filepath = join(this.folder, `${id}.png`);
		if (fs.existsSync(filepath)) {
			return fs.createReadStream(filepath);
		}
		throw new RangeError("ummmmm uhh ummmmmmm");
	}

	/**
	 * checks if a movie exists
	 * @param id movie id
	 * @returns whether it exists or not
	 */
	static exists(id:string): boolean {
		return Database.exists("movies", id);
	}

	/**
	 * deletes a movie do i really have to explain this to you
	 * @param id movie id
	 * @throws {RangeError} if it doesn't exist
	 */
	static delete(id:string): Promise<void> {
		return new Promise((resolve, reject) => {
			Database.delete("movies", id);
			fs.unlinkSync(join(this.folder, id + ".xml"));
			fs.unlinkSync(join(this.folder, id + ".png"));
			resolve();
		});
	}

	/**
	 * assigns a watermark to a movie
	 * @param mId movie id
	 * @param wId watermark id
	 * @throws {RangeError} movie does not exist
	 */
	static setWatermark(mId:string, wId?:string) {
		return Database.update("movies", mId, { watermark: wId });
	}

	/**
	 * what do you think
	 * @param xml the movie xml
	 * @param thumb movie thumbnail in .png format
	 * @param id movie id, if overwriting an old one
	 * @param saveAsStarter
	 * @throws {RangeError} four, oh, four. ohhh, four....
	 * @returns movie id
	 */
	static async save(
		xml: Buffer,
		thumbnail: Buffer | void,
		id: string,
		saveAsStarter: boolean
	): Promise<string> {
		const newMovie = typeof id == "undefined";
		if (!newMovie && !this.exists(id)) {
			throw new RangeError("Movie does not exist and you fucking suck");
		}
		id ||= generateId();

		if (thumbnail) {
			fs.writeFileSync(join(this.folder, id + ".png"), thumbnail);
		}
		fs.writeFileSync(join(this.folder, id + ".xml"), xml);

		const meta = await this.extractMeta(id);
		const properties:Movie = {
			id: id,
			duration: meta.durationString,
			date: meta.date.toISOString(),
			title: meta.title,
			sceneCount: meta.sceneCount,
		};
		if (Settings.defaultWatermark != "none") {
			properties.watermark = Settings.defaultWatermark;
		}
		if (newMovie && saveAsStarter) {
			properties.folder = "starters";
		}
		try {
			Database.update("movies", id, properties);
		} catch (e) {
			Database.insert("movies", properties);
		}
		return id;
	}

	/**
	 * unpacks a movie zip
	 * @param body zip containing the movie and its assets
	 * @param isStarter is the movie being uploaded as a starter
	 * @returns movie id
	 */
	static upload(body:Buffer, isStarter = false): Promise<string> {
		return new Promise(async (resolve, reject) => {
			const id = generateId();
			const [xml, thumb] = await Parse.unpack(body);
			fs.writeFileSync(join(this.folder, id + ".xml"), xml);
			fs.writeFileSync(join(this.folder, id + ".png"), thumb);
			this.extractMeta(id).then((meta) => {
				const info:Movie = {
					id,
					duration: meta.durationString,
					date: meta.date.toISOString(),
					title: meta.title,
					sceneCount: meta.sceneCount,
				};
				if (isStarter) {
					info.folder = "starters"
				}

				Database.insert("movies", info);
				resolve(id);
			});
		});
	}

	/**
	 * extracts audio information from a movie xml
	 * @param id movie id
	 * @returns list of objects representing audio clips and how they
	 * should be played
	 */
	static async extractAudioTimes(id:string): Promise<{
		filepath: string,
		start: number,
		stop: number,
		trimStart: number,
		trimEnd: number,
		fadeIn: {
			duration: number;
			vol: number;
		},
		fadeOut: {
			duration: number;
			vol: number;
		}
	}[]> {
		if (!this.exists(id)) {
			throw "404";
		}
		const filepath = join(this.folder, `${id}.xml`);
		const xml = fs.readFileSync(filepath);
		const audio = await Parse.extractAudioTimes(xml);
		return audio;
	}

	/**
	 * Gets movie metadata from an XML.
	 * @param id movie id
	 * @returns movie information 
	 */
	static async extractMeta(id:string): Promise<{
		date: Date,
		durationString: string,
		duration: number,
		sceneCount: number,
		title: string,
		id: string
	}> {
		const filepath = join(this.folder, `${id}.xml`);
		if (!fs.existsSync(filepath)) {
			throw "404";
		}
		const buffer = fs.readFileSync(filepath);

		// title
		let title = buffer.subarray(
			buffer.indexOf("<title>") + 16,
			buffer.indexOf("]]></title>")
		).toString().trim();
		if (title.length == 0) {
			title = "Untitled";
		}

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
	 * moves a selection of movies or folders to a target folder
	 * throws '404' if target folder doesn't exist
	 * @param movies list of movie ids
	 * @param movieFolders list of movie folders
	 * @param targetFolderId target folder to move selection to
	 */
	static moveToFolder(
		{
			movieIds,
			movieFolderIds
		}: { movieIds:string[], movieFolderIds:string[] },
		targetFolderId: string
	) {
		// if (targetFolderId == "/") {
		// 	targetFolderId = undefined;
		// } else {
		// 	if (!database.get("movie_folders", targetFolderId)) {
		// 		throw "t-404";
		// 	}
		// }
		// for (const movieId of movieIds) {
		// 	const success = database.update("movies", movieId, {
		// 		parent_id: targetFolderId
		// 	});
		// 	if (!success) {
		// 		throw "m-404";
		// 	}
		// }
		// for (const folderId of movieFolderIds) {
		// 	const success = database.update("movie_folders", folderId, {
		// 		parent_id: targetFolderId
		// 	});
		// 	if (!success) {
		// 		throw "f-404";
		// 	}
		// }
	}

	/**
	 * renames a folder
	 * @param path folder path
	 * @param newName new folder name
	 */
	static renameFolder(path:string, newName:string) {
		// let movies = database.select("movies");
		// movies = movies.filter((m) => m.parent_id && m.parent_id.startsWith(path));
		// console.log(path)
		// for (const movie of movies) {
		// 	const index = path.length;
		// 	const folders = movie.parent_id.substring(index + 1).split("/");
		// 	const pathBase = path.split("/").slice(0, -1);
		// 	let newPath = "";
		// 	if (pathBase.length > 0) {
		// 		newPath = pathBase.join("/") + "/";
		// 	}
		// 	newPath += newName;
		// 	if (folders.length > 0) {
		// 		newPath += folders.map(v => v != "" ? "/" + v : "");
		// 	}
		// 	database.update("movies", movie.id, { parent_id:newPath });
		// }
	}

	/**
	 * deletes a folder by moving all moves to parent
	 * @param path folder path
	 */
	static deleteFolder(path:string) {
		// let newParent = path.split("/").slice(0, -1).join("/") ?? "";
		// const movies = database.select("movies").filter(m => {
		// 	return m.parent_id && m.parent_id.startsWith(path)
		// });
		// const ids = movies.map(m => [m.id, m.parent_id]);
		// for (const [id, path] of ids) {
		// 	let index:number;
		// 	if (newParent.length == 0) {
		// 		index = 0;
		// 	} else {
		// 		index = path.indexOf(newParent) + newParent.length;
		// 	}
		// 	const newPath = path.substring(0, index);
		// 	database.update("movies", id, { parent_id:newPath });
		// }
	}
};
