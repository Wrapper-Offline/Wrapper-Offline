/***
 * asset api
 */
const fs = require("fs");
const folder = `${__dirname}/../${process.env.CACHÉ_FOLDER}`;

module.exports = {
	load(aId) { // look for match in folder
		var match = false;
		fs.readdirSync(`${folder}`)
			.forEach(filename => {
				if (filename.search(aId) !== -1) match = filename;
			})
		return match ? fs.readFileSync(`${folder}/${match}`) : null;
	},
	save(wf, aId) {
		// save the waveform
		fs.writeFileSync(`${folder}/${aId}.wf`, wf);
		return true;
	}
};