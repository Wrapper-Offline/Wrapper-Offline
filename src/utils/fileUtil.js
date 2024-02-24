const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const nodezip = require("node-zip");

ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);

module.exports = {
	/**
	 * converts a readable stream to an mp3
	 * @param {import("stream".Readable)} data
	 * @param {string} fileExt
	 * @returns {Promise<import("stream").Writable | import("stream").PassThrough>}
	 */
	convertToMp3(data, fileExt) {
		return new Promise((res, rej) => {
			const command = ffmpeg(data)
				.inputFormat(fileExt)
				.toFormat("mp3")
				.audioBitrate(4.4e4)
				.on("error", (err) => rej(err));
			res(command.pipe());
		});
	},

	/**
	 * creates a new zip with a file inside it
	 * @param {string} fileName path to the actual file
	 * @param {string} zipName file path within the zip
	 */
	zippy(fileName, zipName) {
		if (!fs.existsSync(fileName)) {
			throw new Error(`Directory '${fileName}' doesn't exist.`);
		}
		const buffer = fs.readFileSync(fileName);
		const zip = nodezip.create();
		this.addToZip(zip, zipName, buffer);
		return zip.zip();
	},

	/**
	 * @param {nodezip.ZipFile} zip 
	 * @param {string} zipName file path within the zip
	 * @param {Buffer} buffer file contents
	 */
	addToZip(zip, zipName, buffer) {
		zip.add(zipName, buffer);
		if (zip[zipName].crc32 < 0)
			zip[zipName].crc32 += 4294967296;
	},
};
