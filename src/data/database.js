const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/** @typedef {import("../server/models/asset").Asset} Asset */
/** @typedef {import("../server/models/movie").Movie} Movie */

/**
 * @typedef {Object} DatabaseJson
 * @property {string} version
 * @property {Asset} assets
 * @property {Movie} movies
 */

module.exports = class Database {
	#path = path.join(__dirname, "../../", process.env.SAVED_FOLDER, "database.json");
	/** @type {DatabaseJson} */
	#json = {
		version: process.env.WRAPPER_VER,
		assets: [],
		movies: []
	};
	/** @type {Database} */
	static #instance;

	constructor() {
		// create the file if it doesn't exist
		if (!fs.existsSync(this.#path)) {
			console.error("Database doesn't exist! Creating...");
			this.#save(this.#json);

			try {
				this.#refresh();
			} catch (e) {
				throw new Error("Something is extremely awfully horribly terribly preposterously crazily insanely madly wrong. You may be in a read-only system/admin folder.");
			}
		}
		this.#refresh();
		if (!this.#json.version) {
			// wrapper versions prior to 2.1.0 don't store the database
			// version so we're going to be adding it and modifying things
			// as the database structure changes
			this.#json.version = "2.0.0";
		}
		if (this.#json.version == "2.0.0") {
			this.#json.version = "2.1.0";
			this.#save(this.#json);
		}
		// just keep adding onto this as you change stuff
	}

	static get instance() {
		if (!Database.#instance) {
			Database.#instance = new Database();
		}
		return Database.#instance;
	}

	/**
	 * @summary generates a random id
	 */
    static generateId() {
        return crypto.randomBytes(4).toString("hex");
    }

	/**
	 * refreshes this.#json using the this.#json in its current state
	 */
	#refresh() { // refresh the database vars
		const data = fs.readFileSync(this.#path);
		this.#json = JSON.parse(data.toString());
	}

	/**
	 * saves this.#json into the database.json file
	 * @param {DatabaseJson} newData
	 */
	#save(newData) {
		try {
			fs.writeFileSync(this.#path, JSON.stringify(newData, null, "\t"));
		} catch (err) {
			console.error("Error saving DB:", err);
		}
	}

	/**
	 * deletes a field from the database
	 * @param {"assets" | "movies"} from category to select from
	 * @param {string} id id to look for
	 * @returns did it work or not
	 */
	delete(from, id) {
		const object = this.get(from, id);
		if (object == false) {
			return false;
		}
		const index = object.index;

		this.#json[from].splice(index, 1);
		this.#save(this.#json);
		return true;
	}

	/**
	 * @overload
	 * @param {"assets"} from
	 * @param {string} id
	 * @returns {{
	*  data: Asset,
	*  index: number
	* } | false} returns object if it worked, false if it didn't
	*/
	/**
	 * @overload
	 * @param {"movies"} from
	 * @param {string} id
	 * @returns {{
	 *  data: Movie,
	 *  index: number
	 * } | false} returns object if it worked, false if it didn't
	 */
	/**
	 * returns an object from the database
	 * @param {"movies | "assets"} from category to select from
	 * @param {string} id id to look for
	 * @returns {{
	 *  data: Movie | Asset,
	 *  index: number
	 * } | false} returns object if it worked, false if it didn't
	 */
	get(from, id) {
		this.#refresh();

		const category = this.#json[from];
		let index;
		const object = category.find((i, ind) => {
			if (i.id == id) {
				index = ind;
				return true;
			}
		});
		if (!object) {
			return false;
		}

		return {
			data: object,
			index: index
		}
	}

	/**
	 * @overload
	 * @param {"assets"} into
	 * @param {Asset} data
	 */
	/**
	 * @overload
	 * @param {"movies"} into
	 * @param {Movie} data
	 */
	/**
	 * Adds another field to the database.
	 * @param {"assets" | "movies"} into Category to insert into.
	 * @param {Asset | Movie} data Data to insert.
	 */
	insert(into, data) {
		this.#refresh();
		this.#json[into].unshift(data);
		this.#save(this.#json);
	}

	/**
	 * @overload
	 * @param {"assets"} from
	 * @param {?object} where
	 * @returns {Asset[]}
	 */
	/**
	 * @overload
	 * @param {"movies"} from
	 * @param {?object} where
	 * @returns {Movie[]}
	 */
	/**
	 * Returns the database.
	 * @param {"assets" | "movies"} from Category to select from.
	 * @param {?object} where Parameters for each key.
	 * @returns {(Asset | Movie)[]}
	 */
	select(from, where) {
		this.#refresh();

		const category = this.#json[from];
		const filtered = category.filter((/** @type {Record<String, unknown>} */ val) => {
			for (const [key, value] of Object.entries(where || {})) {
				if (val[key] && val[key] != value) {
					return false;
				}
			}
			return true;
		});
		return filtered;
	}

	/**
	 * Updates a field from the database.
	 * @param {"assets" | "movies"} from Category to select from.
	 * @param {string} id Id to look for.
	 * @param {object} data New data to save.
	 * @returns {boolean} did it work or not
	 */
	update(from, id, data) {
		const object = this.get(from, id);
		if (object == false) {
			return false;
		}
		const index = object.index;

		Object.assign(this.#json[from][index], data);
		this.#save(this.#json);
		return true;
	}
};
