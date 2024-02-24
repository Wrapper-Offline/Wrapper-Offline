const fs = require("fs");
const path = require("path");

module.exports = class WaveformModel {
	static folder = path.join(__dirname, "../../../", process.env.CACHÉ_FOLDER);

	/**
	 * Looks for a match in the _CACHÉ folder.
	 * If there's no match found, it returns null.
	 * @param {string} id asset id
	 */
	static load(id) {
		const filepath = path.join(this.folder, id + ".wf");
		const exists = fs.existsSync(filepath);
		if (!exists) {
			throw new Error("404");
		}
		return fs.readFileSync(filepath);
	}

	/**
	 * Saves the waveform to the _CACHÉ folder.
	 * @param {Buffer} wf waveform data
	 * @param {string} id asset id
	 */
	static save(wf, id) {
		fs.writeFileSync(path.join(this.folder, id + ".wf"), wf);
	}
};
