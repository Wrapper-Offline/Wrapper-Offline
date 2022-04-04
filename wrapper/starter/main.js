/***
 * starter api
 */
const fs = require("fs");
const database = require("../data/database"), DB = new database();
const nodezip = require("node-zip");
const folder = `${__dirname}/../${process.env.ASSET_FOLDER}`;
const fUtil = require("../fileUtil");
const parse = require("../data/parse");

module.exports = {
	load(mId) {
		return new Promise((res, rej) => {
			let filePath = `${folder}/${mId}.xml`;
			console.log(filePath);
			if (!fs.existsSync(filePath)) rej("Starter doesn't exist.");

			const buffer = fs.readFileSync(filePath);
			parse.packXml(buffer, mId).then(v => res(v));
		});
	},
	save(movieZip, thumb, id) {
		return new Promise((res, rej) => {
			// save starter info
			id ||= fUtil.generateId();
			const db = DB.get();
			db.assets.push({
				id: id,
				enc_asset_id: id,
				type: "movie",
				title: "Untitled",
				published: "",
				share: {
					type: "none"
				},
				tags: "",
				file: `${id}.xml`
			});
			DB.save(db);
			// save the thumbnail
			fs.writeFileSync(`${folder}/${id}.png`, thumb);
			// extract the movie xml and save it
			const zip = nodezip.unzip(movieZip);
			let writeStream = fs.createWriteStream(`${folder}/${id}.xml`);
			parse.unpackZip(zip, thumb, id).then(data => {
				writeStream.write(data, () => {
					writeStream.close();
					res(id);
				});
			});
		});
	},
};