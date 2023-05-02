const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const mp3Duration = require("mp3-duration");
const sharp = require("sharp");

module.exports = {
	/**
	 * gets an mp3 duration in ms
	 * @param {string | Buffer} data mp3 path or buffer
	 * @returns {Promise<number>}
	 */
	mp3Duration(data) {
		return new Promise((res, rej) => {
			mp3Duration(data, (e, duration) => {
				if (e || !duration) {
					return rej(e);
				}
				const dur = duration * 1e3;
				res(dur);
			});
		});
	},

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
				.on("error", (e) => rej("Error converting audio:", e));
			res(command.pipe());
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
};
