const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const mp3Duration = require("mp3-duration");
const sharp = require("sharp");

module.exports = {
	/**
	 * gets an mp3 duration in ms
	 * @param {string | Buffer} data mp3 path or buffer
	 * @returns {number}
	 */
	mp3Duration(data) {
		return new Promise((res, rej) => {
			mp3Duration(data, async (e, duration) => {
				if (e || !duration) rej(e);
				const dur = duration * 1e3;
				res(dur);
			});
		});
	},

	convertToMp3(data, ext) {
		return new Promise((resolve, rej) => {
			// convert the sound to an mp3
			const command = ffmpeg(data)
				.inputFormat(ext)
				.toFormat("mp3")
				.on("error", (e) => rej("Error converting audio:", e));
			resolve(command.pipe());
		});
	},

	/**
	 * resizes an image
	 * @param {string | Buffer} data image path or buffer
	 * @returns {ReadableStream}
	 */
	resizeImage(data, width, height) {
		return new Promise((resolve, rej) => {
			const stream = sharp(data)
				.resize(width, height, { fit: "fill" });
			resolve(stream);
		});
	},
};
