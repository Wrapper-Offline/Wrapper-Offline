const fs = require("fs");
const httpz = require("@octanuary/httpz");
const database = require("../../data/database"), DB = new database();
const Movie = require("../models/movie");
const group = new httpz.Group();

/*
redirects
*/
// go_full (tutorial)
group.route("*", /\/videomaker\/full\/(\w+)\/tutorial$/, (req, res) => {
	const theme = req.matches[1];
	res.redirect(`/go_full?tray=${theme}&tutorial=0`);
});
// video list
group.route("GET", "/dashboard/videos", (res) => {
	res.redirect("/");
});

/*
thumbs
*/
group.route("*", /\/file\/movie\/thumb\/([^/]+)$/, (req, res) => {
	const id = req.matches[1];

	const readStream = Movie.thumb(id);
	res.setHeader("Content-Type", "image/png");
	readStream.pipe(res); 
});

/*
list
*/
// movies
group.route("GET", "/api/movie/list", (req, res) => {
	res.json(DB.select("movies"));
});
// starters
group.route("GET", "/api/starter/list", (req, res) => {
	res.json(DB.select("assets", { type: "movie" }));
});

/*
delete
*/
group.route("GET", /\/api\/movie\/delete\/([^/]+)$/, async (req, res) => {
	const id = req.matches[1];
	if (!DB.get("movies", id) && !DB.get("assets", id)) {
		res.status(400);
		return res.json({ status: "malformed", msg: "Movie doesn't exist." });
	}

	console.log("(Warning!) Deleting movie #" + id);
	Movie.delete(id);
	res.json({ status: "ok" });
});

/*
upload
*/
group.route("POST", "/api/movie/upload", (req, res) => {
	const file = req.files.import;
	if (!file) {
		console.log("Error uploading movie: No file.");
		res.statusCode = 400;
		return res.json({ msg: "No file" });
	}
	const isStarter = req.body.is_starter;
	const path = file.filepath, buffer = fs.readFileSync(path);

	if (
		file.mimetype !== "application/x-zip-compressed" &&
		file.mimetype !== "application/zip" &&
		!buffer.slice(0, 4).equals(
			Buffer.from([0x50, 0x4b, 0x03, 0x04])
		)
	) {
		console.error("Attempted movie upload with invalid file.");
		res.statusCode = 400;
		return res.json({ msg: "Movie is not a zip" });
	}

	Movie.upload(buffer, isStarter).then((id) => {
		fs.unlinkSync(path);
		res.json({ id: id });
	}).catch((err) => {
		console.error("Error uploading movie:", err);
		res.statusCode = 500;
		res.json({ msg: null });
	});
});

/*
load
*/
group.route(
	"*",
	["/goapi/getMovie/", /\/file\/movie\/file\/([^/]+)$/],
	async (req, res) => {
		const isGet = req.method == "GET";
		const id = isGet ?
			req.matches[1] :
			req.query.movieId;
		res.assert(id, 400, "1No ID specified.");
		
		Movie.load(id, isGet).then((buf) => {
			res.setHeader("Content-Type", "application/zip");
			res.end(buf);
		}).catch((err) => {
			console.log("Error loading movie:", err);
			res.status(404);
			res.end("1");
		});
	}
);

/*
save
*/
// movies
group.route("POST", "/goapi/saveMovie/", (req, res) => {
	res.assert(req.body.body_zip, 400, "1");
	const trigAutosave = req.body.is_triggered_by_autosave;
	res.assert(!(trigAutosave && !req.body.movieId), 200, "0");

	const isStarter = req.body.isStarter || false;
	const body = Buffer.from(req.body.body_zip, "base64");
	const thumb = trigAutosave ?
		null : Buffer.from(req.body.thumbnail_large, "base64");

	if (!body.slice(0, 4).equals(
		Buffer.from([0x50, 0x4b, 0x03, 0x04])
	)) {
		res.statusCode = 400;
		return res.end("1Movie is not a zip");
	}

	Movie.save(body, thumb, req.body.movieId, isStarter).then((id) => {
		res.end("0" + id);
	}).catch((err) => {
		res.statusCode = 500;
		res.end("1" + err);
		console.error("Error saving movie:", err);
	});
});
// starter
group.route("POST", "/goapi/saveTemplate/", (req, res) => {
	res.assert(req.body.body_zip, req.body.thumbnail_large, 400, "1");
	const body = Buffer.from(req.body.body_zip, "base64");
	const thumb = Buffer.from(req.body.thumbnail_large, "base64");

	if (!body.slice(0, 4).equals(
		Buffer.from([0x50, 0x4b, 0x03, 0x04])
	)) {
		res.statusCode = 400;
		return res.end("1Movie is not a zip");
	}

	Movie.save(body, thumb, req.body.movieId, true).then((id) => {
		res.end("0" + id);
	}).catch((err) => {
		res.statusCode = 500;
		res.end("1" + err);
		console.error("Error saving starter:", err);
	});
});

module.exports = group;
