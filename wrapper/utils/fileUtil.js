const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const mp3Duration = require("mp3-duration");
const nodezip = require("node-zip");
const sharp = require("sharp");

module.exports = {
	/**
	 * converts a readable stream to an mp3
	 * @param {ReadableStream} data 
	 * @param {string} fileExt file type
	 * @returns {Promise<import("stream").PassThrough>}
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
	 * mp3-duration but now it's wrapped in a promise and returns the duration in ms
	 * @param {string | Buffer} data mp3 path or buffer
	 * @returns {Promise<number>}
	 */
	mp3Duration(data) {
		return new Promise((res, rej) => {
			mp3Duration(data, (e, duration) => {
				if (e || !duration) {
					return rej(e);
				}
				res(duration * 1e3);
			});
		});
	},

	/**
	 * resizes an image
	 * @param {string | Buffer} data image path or buffer
	 * @returns {Promise<ReadableStream>}
	 */
	resizeImage(data, width, height) {
		return new Promise((res, rej) => {
			const stream = sharp(data)
				.resize(width, height, { fit: "fill" });
			res(stream);
		});
	},

	/**
	 * @param {string} fileName 
	 * @param {string} zipName 
	 */
	zippy(fileName, zipName) {
		if (!fs.existsSync(fileName)) return Promise.reject();
		const buffer = fs.readFileSync(fileName);
		const zip = nodezip.create();
		this.addToZip(zip, zipName, buffer);
		return zip.zip();
	},

	/**
	 * @param {nodezip.ZipFile} zip 
	 * @param {string} zipName 
	 * @param {string} buffer 
	 */
	addToZip(zip, zipName, buffer) {
		zip.add(zipName, buffer);
		if (zip[zipName].crc32 < 0)
			zip[zipName].crc32 += 4294967296;
	},
}