const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const httpz = require("@octanuary/httpz");
const Movie = require("../models/movie");
const path = require("path");
const group = new httpz.Group();

ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);

const framerate = 24;
const frameToSec = (f) => f / framerate;

group.route("POST", "/api/export/video_complete", async (req, res) => {
	if (typeof req.body.frames == "undefined" || req.body.frames.length == 0) {
		console.warn("Exporter: Conversion attempted with no frames.");
		res.status(400).json({ msg: "Frames missing." });
		return;
	} else if (typeof req.body.id == "undefined") {
		console.warn("Exporter: Conversion attemped with no movie ID.");
		res.status(400).json({ msg: "Movie ID missing." });
		return;
	}

	console.log("Exporter: Frames sent to server. Writing frames to temp path...");

	/* save all the frames */
	const frames = req.body.frames;
	const base = path.join(__dirname, `../../_EXPORTS/TEMP${req.body.id}`);
	fs.mkdirSync(base);
	for (let i in frames) {
		const frameData = Buffer.from(frames[i == 1 ? 2 : i], "base64");
		fs.writeFileSync(path.join(base, i + ".png"), frameData);
	}

	console.log("Exporter: Saving frames completed. Converting frames to a video...");
	
	/* join them together */
	const chicanery = ffmpeg()
		.input(base + "/%d.png")
		.on("start", (cmd) => {
			console.log("Exporter: Spawned Ffmpeg with command:", cmd);
		})
		.on("end", () => {
			console.log("Exporter: Video conversion successful.");
			res.json({ path: `/exported/${req.body.id}.mp4` });
			for (const i in frames) {
				fs.unlinkSync(path.join(base, i + ".png"));
			}
			fs.rmdirSync(base);
		})
		.on("error", (err) => {
			console.error("Exporter: Error processing video:", err);
			res.status(500).json({ msg: "Internal Server Error" });
			for (const i in frames) {
				fs.unlinkSync(path.join(base, i + ".png"));
			}
			fs.rmdirSync(base);
		});
	
	/* add the audio ourselves, i really don't wanna make it record it */
	let audios = await Movie.extractAudioTimes(req.body.id);
	let complexFilterString = "";
	let delay = 0;
	audios = audios.sort((a, b) => a.start - b.start);
	for (const i in audios) {
		const audio = audios[i];
		const baseDuration = audio.stop - audio.start;
		const duration = Math.max(baseDuration, audio.trimEnd) - audio.trimStart;
		chicanery.input(audio.filepath);
		chicanery.addInputOption("-t", frameToSec(duration));
		if (audio.trimStart > 0) {
			chicanery.seekInput(frameToSec(audio.trimStart));
		}
		complexFilterString += `[${Number(i) + 1}:a]adelay=${(frameToSec(audio.start) * 1e3) - delay}[audio${i}];`;
		delay += 100;
	}
	chicanery
		.complexFilter(complexFilterString + `${audios.map((_, i) => `[audio${i}]`).join("")}amix=inputs=${audios.length}[a]`)
		.addOutputOptions("-async", "1")
		.videoCodec("libx264")
		.audioCodec("aac")
		.outputOptions("-pix_fmt", "yuv420p")
		.outputOptions("-ac", "1")
		.outputOptions("-map", "0:v")
		.outputOptions("-map", "[a]")
		.outputOptions("-framerate", framerate)
		.outputOptions("-r", framerate)
		.duration(frameToSec(frames.length))
		.output(path.join(__dirname, `../../_EXPORTS/${req.body.id}.mp4`))
		.run();
});

module.exports = group;
