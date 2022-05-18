/**
 * starter api
 */
// module
const fs = require("fs");
const nodezip = require("node-zip");
const path = require("path");
// vars
const folder = path.join(__dirname, "../", process.env.SAVED_FOLDER);
// stuff
const database = require("../data/database"), DB = new database();
const { meta } = require("../movie/main.js");
const fUtil = require("../fileUtil");

module.exports = {
	/**
	 * Extracts the movie XML from a zip and saves it.
	 * @param {Buffer} body 
	 * @param {Buffer} thumb 
	 * @param {string} mId 
	 * @returns {Promise<string>}
	 */
	async save(body, thumb, mId) {
		return new Promise((resolve, reject) => {
			mId ||= fUtil.generateId();

			// save the thumbnail
			fs.writeFileSync(path.join(folder, `${mId}.png`), thumb);
			// extract the movie xml and save it
			const zip = nodezip.unzip(body);
			const xmlStream = zip["movie.xml"].toReadStream();

			let writeStream = fs.createWriteStream(path.join(folder, `${mId}.xml`));
			xmlStream.on("data", b => writeStream.write(b));
			xmlStream.on("end", async () => {
				writeStream.close();

				// save starter info
				meta(mId, true)
					.then(mMeta => {
						const db = DB.get();
						db.assets.push({
							id: mId,
							enc_asset_id: mId,
							type: "movie",
							title: mMeta.title,
							sceneCount: mMeta.sceneCount,
							tags: "",
							file: `${mId}.xml`
						});
						DB.save(db);
						resolve(mId);
					});
			});
		});
	}
}
