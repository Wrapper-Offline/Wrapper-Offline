// modules
const fs = require("fs");
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.SAVED_FOLDER);
const baseDb = { assets: [], movies: [], folders: [], watermarks: [] };

module.exports = class {
	constructor() {
		this.path = path.join(folder, "database.json");
		// create the file if it doesn't exist
		if (!fs.existsSync(this.path)) {
			console.error("Database doesn't exist! Creating...");
			this.save(baseDb);
		}
		try {
			this.refresh();
		} catch (err) {
			console.error("Error loading DB:", err)
			// return the base db
			return baseDb;
		}
	}

	refresh() { // refresh the database vars
		const data = fs.readFileSync(this.path);
		this.json = JSON.parse(data);
	}

	/**
	 * 
	 * @returns {{ assets: [], watermarks: [] }}
	 */
	get() {
		this.refresh();
		return this.json
	}

	save(newData) {
		try {
			fs.writeFileSync(this.path, JSON.stringify(newData, null, "\t"), { recursive: true });
			return true;
		} catch (err) {
			console.error("Error saving DB:", err);
			return false;
		}
	}
};
