// modules
const fs = require("fs");
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.SAVED_FOLDER);
let baseDb;

module.exports = class GoDatabase {
	constructor(isSettings = false) {
		if (isSettings) {
			this.path = path.join(folder, "settings.json");
			baseDb = {
				DISCORD_RPC: false, // Shows your Wrapper activity in Discord.
				TRUNCATED_THEMELIST: true, // Cuts down the amount of themes that clog up the themelist in the videomaker.
				SHOW_WAVEFORMS: true, // Forces waveforms to be off in the videomaker.
				DEFAULT_WATERMARK: "twoLines", // Default watermark (if the GA watermark is chosen).
				IS_WIDE: "1" // Sets the video player to 16:9
			};
		} else {
			this.path = path.join(folder, "database.json");
			baseDb = { assets: [], movies: [] };
		}
		// create the file if it doesn't exist
		if (!fs.existsSync(this.path)) {
			console.error("Database doesn't exist! Creating...");
			this.save(baseDb);

			try {
				this.#refresh();
			} catch (e) {
				throw new Error("Something is extremely awfully horribly terribly preposterously crazily insanely madly wrong. You may be in a read-only system/admin folder.");
			}
		}
	}

	#refresh() { // refresh the database vars
		const data = fs.readFileSync(this.path);
		this.json = JSON.parse(data);
	}

	save(newData) {
		try {
			fs.writeFileSync(this.path, JSON.stringify(newData, null, "\t"));
			return true;
		} catch (err) {
			console.error("Error saving DB:", err);
			return false;
		}
	}

	/**
	 * Deletes a field from the database.
	 * @param {string} from Category to select from.
	 * @param {string} id Id to look for.
	 */
	delete(from, id) {
		const { index } = this.get(from, id);

		this.json[from].splice(index, 1);
		this.save(this.json);
	}

	/**
	 * Returns an object from the database.
	 * @param {string} from Category to select from.
	 * @param {string} id Id to look for.
	 * @returns {{
	 * 	data: object,
	 * 	index: number
	 * }}
	 */
	get(from, id) {
		if (!from || !id) {
			throw new Error("Must input a category to select from or an id to look for.");
		}

		this.#refresh();
		/** @type {Array} */
		const json = this.json[from];
		let index;

		const object = json.find((i, ind) => {
			if (i.id == id) {
				index = ind;
				return true;
			}
		});

		if (!object) {
			throw new Error("Field not found.");
		}

		return {
			data: object,
			index
		};
	}

	/**
	 * Adds another field to the database.
	 * @param {string} from Category to insert into.
	 * @param {object} where Data to insert.
	 */
	insert(into, data) {
		this.#refresh();
		this.json[into].unshift(data);
		this.save(this.json);
	}

	/**
	 * Returns the database.
	 * @param {string} from Category to select from.
	 * @param {?object} where Parameters for each key.
	 * @returns {object}
	 */
	select(from, where) {
		this.#refresh();

		let json;
		if (from) {
			json = this.json[from];
			const filtered = json.filter((val) => {
				for (const [key, value] of Object.entries(where || {})) {
					if (val[key] && val[key] != value) {
						return false;
					}
				}
				return true;
			});
			return filtered;
		}
		return this.json;
	}

	/**
	 * Updates a field from the database.
	 * @param {string} from Category to select from.
	 * @param {string} id Id to look for.
	 * @param {object} data New data to save.
	 */
	update(from, id, data) {
		if (!data) {
			throw new Error("Must input new data to save.");
		}

		const { index } = this.get(from, id);

		Object.assign(this.json[from][index], data);
		this.save(this.json);
	}
};
