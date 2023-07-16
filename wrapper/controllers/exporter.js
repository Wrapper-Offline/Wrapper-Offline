const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const httpz = require("@octanuary/httpz");
const Movie = require("../models/movie");
const path = require("path");
const group = new httpz.Group();

ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);

group.route("POST", "/api/export/video_complete", async (req, res) => {
	const frames = req.body.frames;
	const base = path.join(__dirname, "../../frames");
	for (const i in frames) {
		const frameData = Buffer.from(frames[i], "base64");
		fs.writeFileSync(path.join(base, i + ".png"), frameData);
	}
	
	const ok = ffmpeg()
		
		.input(base + "/%d.png")
		
		.on("start", function (commandLine) {
			console.log("Spawned Ffmpeg with command:", commandLine);
		})
		.on("end", () => res.end());
	
	// const audios = await Movie.getAudio(req.body.id);
	// let complexFilterString = "";
	// for (const i in audios) {
	// 	const audio = audios[i];
	// 	const baseDuration = audio.stop - audio.start;
	// 	const duration = Math.max(baseDuration, audio.trimEnd) - audio.trimStart;
	// 	console.log(duration, baseDuration)
	// 	ok.input(audio.filepath);
	// 	ok.addInputOptions("-t", frameToSec(duration));
	// 	complexFilterString += `[${i}:a]adelay=` + frameToSec(audio.start - 1) * 1e3 + `[audio${i}];`
	// }
	ok
		//.complexFilter(complexFilterString + `${audios.map((_, i) => `[audio${i}]`).join("")}amerge[a]`)
		.videoCodec("libx264")
		// .audioCodec("aac")
		// .outputOptions("-map", "0:v")
		// .outputOptions("-map", "[a]")
		.outputOptions("-framerate", "23.97")
		.outputOptions("-r", "23.97")
		.output(path.join(base, "output.mp4"))
		.run();
});

function frameToSec(f) {
	const dur = f / 23.97;
	if (dur == NaN) {
		dur = 0;
	}
	return dur;
}

module.exports = group;
