const fs = require("fs");
const path = require("path");
const folder = path.join(__dirname, "../../", process.env.CACHÉ_FOLDER);

module.exports = {
	/**
	 * Looks for a match in the _CACHÉ folder.
	 * If there's no match found, it returns null.
	 * @param {string} id 
	 * @returns {Buffer | null}
	 */
	load(id) {
		const filepath = path.join(folder, id + ".wf");
		const exists = fs.existsSync(filepath);
		return exists ? fs.readFileSync(filepath) : null;
	},

	/**
	 * Saves the waveform to the _CACHÉ folder.
	 * @param {Buffer} wf 
	 * @param {string} id 
	 * @returns {boolean}
	 */
	save(wf, id) {
		fs.writeFileSync(path.join(folder, id + ".wf"), wf);
		return true;
	}
};