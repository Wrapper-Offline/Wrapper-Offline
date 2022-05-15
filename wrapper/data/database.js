// modules
const fs = require("fs");

module.exports = class {
	constructor() {
		this.path = `${__dirname}/../${process.env.ASSET_FOLDER}/database.json`;
		// create the file if it doesn't exist
		if (!fs.existsSync(this.path)) {
			console.error("Database doesn't exist! Creating...")
			this.save({ assets: [], faw: [] })
		}
		try {
			this.refresh();
		} catch (err) {
			console.error("Error loading DB: " + err)
			// return a fake db
			return { assets: [], faw: [] };
		}
	}
	refresh() { // refresh the database vars
		const data = fs.readFileSync(this.path);
		this.json = JSON.parse(data);
	}
	get() { this.refresh(); return this.json }
	save(newData) {
		try {
			fs.writeFileSync(this.path, JSON.stringify(newData, null, "\t"));
			return true;
		} catch (err) {
			console.error("Error saving content to DB: " + err);
			return false;
		}
	}
};