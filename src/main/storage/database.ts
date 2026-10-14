import type { Asset } from "../../main/server/models/asset";
import crypto from "crypto";
import directories from "./directories";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Movie } from "../../main/server/models/movie";
import type { Watermark } from "../../main/server/models/watermark";

export interface Folder {
	id: string,
	name: string,
	color: number,
	folder?: string
};

type DatabaseJson = {
	version: string,
	assets: Asset[],
	movies: Movie[],
	movie_folders: Folder[],
	watermarks: Watermark[]
};

type ArrayKey<T> = {
	[K in keyof T]: T[K] extends any[] ? K : never
}[keyof T];
export type DBJsonArrayKey = ArrayKey<DatabaseJson>;
type DBJsonArrayProp<K extends DBJsonArrayKey> = DatabaseJson[K][number];

const charMap = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-".split("");

export class Database {
	private path = join(directories.saved, "database.json");
	private json:DatabaseJson = {
		version: process.env.WRAPPER_VER as string,
		assets: [],
		movies: [],
		movie_folders: [],
		watermarks: [],
	};
	private static _instance:Database;

	constructor() {
		if (!existsSync(this.path)) {
			console.warn("Database doesn't exist! Creating...");
			this.save(this.json);

			try {
				this.refresh();
			} catch (e) {
				console.error("Something is extremely awfully horribly terribly preposterously crazily insanely madly wrong. You may be in a read-only system/admin folder.");
				process.exit(1);
			}
		}
		this.refresh();
		let json = this.json;
		if (!json.version) {
			// wrapper versions prior to 2.1.0 don't store the database
			// version so we're going to be adding it and modifying things
			// as the database structure changes
			json.version = "2.0.0";
		}
		if (json.version == "2.0.0") {
			const oldVer = json.version;
			json.version = "2.1.0";
			json.movie_folders = [];
			const watermarks = this.select("assets", {
				//@ts-ignore
				type: "watermark"
			});
			json.watermarks = watermarks.map(w => ({
				id: w.id
			}));
			console.log(`Database upgraded from ${oldVer} to v2.1.0!`);
		}
		if (json.version == "2.1.0") {
			const oldVer = json.version;
			json.version = "2.2.0";
			for (const i in json.assets) {
				const asset = json.assets[i];
				if ((asset as any).type == "movie") {
					json.movies.unshift({
						id: asset.id,
						duration: (asset as any).duration,
						date: (asset as any).date,
						title: (asset as any).title,
						sceneCount: (asset as any).sceneCount,
						folder: "starters"
					});
					json.assets.splice(Number(i), 1);
					continue;
				}
				if (asset.type == "char") {
					asset.theme = (asset as any).themeId;
					delete (asset as any).themeId;
				}
				asset.name = (asset as any).title;
				delete (asset as any).title;
			}
			console.log(`Database upgraded from ${oldVer} to v2.2.0!`);
		}
		// just keep adding onto this as you change stuff
		this.save(json);
	}

	static get instance() {
		if (!Database._instance) {
			Database._instance = new Database();
		}
		return Database._instance;
	}

	/**
	 * refreshes this.json by reading the db file
	 */
	private refresh() { // refresh the database vars
		const data = readFileSync(this.path);
		this.json = JSON.parse(data.toString());
	}

	/**
	 * saves this.json into the database.json file
	 * @param newData
	 */
	private save(newData:DatabaseJson) {
		try {
			writeFileSync(this.path, JSON.stringify(newData, null, "\t"));
		} catch (err) {
			console.error("Error saving DB:", err);
		}
	}

	/**
	 * returns an object from the database
	 * @param from category containing the object
	 * @param id id of the object to look for
	 * @throws {RangeError} object does not exist
	 * @returns the object
	 */
	get<K extends DBJsonArrayKey>(from:K, id:string): DBJsonArrayProp<K> {
		const category = this.json[from];
		for (let i:number = 0; i < category.length; i++) {
			const obj = category[i];
			if (obj.id == id) {
				return obj;
			}
		}
		throw new RangeError("Object does not exist kys");
	}

	/**
	 * returns the index of an object in the database
	 * @param from category containing the object
	 * @param id id of the object to look for
	 * @throws {RangeError} object does not exist
	 * @returns the object's index
	 */
	getIndex<K extends DBJsonArrayKey>(from:K, id:string): number {
		const category = this.json[from];
		for (let i:number = 0; i < category.length; i++) {
			const obj = category[i];
			if (obj.id == id) {
				return i;
			}
		}
		throw new RangeError("object is no existing D: !!!!!");
	}

	/**
	 * checks if an object exists
	 * @param from category containing the object
	 * @param id id of the object to look for
	 * @returns whether the object exists
	 */
	exists<K extends DBJsonArrayKey>(from:K, id:string): boolean {
		const category = this.json[from];
		for (let i:number = 0; i < category.length; i++) {
			const obj = category[i];
			if (obj.id == id) {
				return true;
			}
		}
		return false;
	}

	/**
	 * updates an object in the database
	 * @param from category containing the object
	 * @param id id of the object to look for
	 * @param data new data to assign to the object
	 * @throws {RangeError} object does not exist
	 */
	update<K extends DBJsonArrayKey>(from:K, id:string, data:Partial<DBJsonArrayProp<K>>) {
		const index = this.getIndex(from, id);
		Object.assign(this.json[from][index], data);
		this.save(this.json);
	}

	/**
	 * removes an object from the database
	 * @param from category containing the object
	 * @param id id of the object to delete
	 * @throws {RangeError} object does not exist
	 */
	delete(from:DBJsonArrayKey, id:string) {
		const index = this.getIndex(from, id);
		this.json[from].splice(index, 1);
		this.save(this.json);
	}

	/**
	 * adds an object to the database
	 * @param into category to insert the object
	 * @param obj object to insert
	 */
	insert<K extends DBJsonArrayKey>(into:K, obj:DBJsonArrayProp<K>) {
		this.json[into].unshift(obj as Asset & Movie & Folder & Watermark);
		this.save(this.json);
	}

	/**
	 * selects all objects that match a filter
	 * the filter can contain anything. if the value of a filter
	 * key is an array, this will check if the value of the object
	 * matches anything in it
	 * @param from Category to select from.
	 * @param where Parameters for each key.
	 */
	select<K extends DBJsonArrayKey>(
		from: K,
		where?: Partial<DBJsonArrayProp<K>>
	): DBJsonArrayProp<K>[] {
		const category = this.json[from];
		return where ?
			category.filter((val:Record<string, any>) => {
				for (const [key, value] of Object.entries(where)) {
					if (typeof value == "object") {
						if (!value.includes((val[key] || ""))) {
							return false;
						}
					} else if (val[key] && val[key] != value) {
						return false;
					}
				}
				return true;
			}) : category;
	}
};

/**
 * @summary generates a random id
 */
export function generateId() {
	let id = "";
	for (const n of crypto.randomBytes(8)) {
		id += charMap[n % 64];
	}
	return id;
}

export default Database.instance;
