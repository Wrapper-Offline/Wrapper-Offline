const fs = require("fs");
const stringUtil = require("../utils/string.util");
const httpz = require("@octanuary/httpz");
const database = require("../../data/database"), DB = new database();
const Movie = require("../models/movie");
const nodezip = require("node-zip");
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
info
*/
group.route("GET", "/api/movie/get_info", (req, res) => {
	const id = req.query.id;
	if (typeof id == "undefined") {
		res.status(400).json({ msg: "Movie ID missing." });
		return;
	}

	const info = DB.get("movies", id)?.data;
	if (info) {
		res.json(info);
	} else {
		res.status(404).json({ msg: "Movie not found." });
	}
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
	console.log(`Controllers.movie#delete: Deleting movie #${id}...`);
	Movie.delete(id).then(() => {
		console.log(`Controllers.movie#delete: Successfully deleted movie #${id}.`);
		res.end();
	}).catch((err) => {
		if (typeof err.status !== "undefined" && err.status == 404) {
			console.warn("Controllers.movie#upload attempted on nonexistent movie.");
			res.statusCode = 404;
			return res.json({ msg: "Movie doesn't exist." });
		}
		console.error("Controllers.movie#upload error:", err);
		res.statusCode = 500;
		res.json({ msg: "Internal server error." });
	});
});

/*
upload
*/
group.route("POST", "/api/movie/upload", (req, res) => {
	const file = req.files.import;
	const isStarter = req.body.is_starter;
	if (typeof file == "undefined") {
		console.warn("Controllers.movie#upload attempted without a file.");
		res.statusCode = 400;
		return res.json({ msg: "No file." });
	}

	const path = file.filepath, buffer = fs.readFileSync(path);
	if (
		file.mimetype !== "application/x-zip-compressed" &&
		file.mimetype !== "application/zip" &&
		!buffer.slice(0, 4).equals(
			Buffer.from([0x50, 0x4b, 0x03, 0x04])
		)
	) {
		console.warn("Controllers.movie#upload attempted with invalid file.");
		res.statusCode = 400;
		return res.json({ msg: "Movie is not a zip." });
	}

	Movie.upload(buffer, isStarter).then((id) => {
		fs.unlinkSync(path);
		res.json({ id: id });
	}).catch((err) => {
		console.error("Controllers.movie#upload error:", err);
		res.statusCode = 500;
		res.json({ msg: null });
	});
});

/*
pack
*/
group.route(
	"*",
	["/goapi/getMovie/", /\/file\/movie\/file\/([^/]+)$/],
	(req, res) => {
		const isPost = req.method == "POST";
		const id = req.body.movieId = isPost ?
			req.query.movieId :
			req.matches[1];
		if (typeof id == "undefined") {
			console.warn("Controllers.movie#pack attemped without ID.");
			res.statusCode = 400;
			return res.end(stringUtil.xmlError(400, "ID not specified."));
		}

		Movie.packMovie(id).then((zipped) => {
			if (isPost) {
				zipped = Buffer.concat([Buffer.alloc(1, 0), zipped]);
			}
			res.setHeader("Content-Type", "application/zip");
			res.end(zipped);
		}).catch((err) => {
			if (typeof err.status !== "undefined" && err.status == 404) {
				console.warn("Controllers.movie#pack attempted on nonexistent movie.");
				res.statusCode = 404;
				return res.end(stringUtil.xmlError(404, "Movie doesn't exist."));
			}
			console.error("Controllers.movie#pack error:", err);
			res.statusCode = 500;
			res.end(stringUtil.xmlError(500, "Internal server error."));
		});
	}
);

/*
save
*/
group.route("POST", ["/goapi/saveMovie/", "/goapi/saveTemplate/"], (req, res) => {
	if (typeof req.body.body_zip == "undefined") {
		console.warn("Controllers.movie#save attempted without movie zip.");
		res.statusCode = 400;
		return res.end(stringUtil.xmlError(400, "No movie zip."));
	}
	const trigAutosave = req.body.is_triggered_by_autosave;
	const saveAsStarter = req.parsedUrl.pathname == "/goapi/saveTemplate/";
	// check if we're autosaving an existing movie
	if (trigAutosave && typeof req.body.movieId == "undefined") {
		return res.end("0");
	} else if ( // check if there's a thumbnail in case this is a manual save
		!trigAutosave && typeof req.body.thumbnail_large == "undefined"
	) {
		console.warn("Controllers.movie#save manually attempted without a thumbnail.");
		res.statusCode = 400;
		return res.end(stringUtil.xmlError(400, "A thumbnail is required on manual saves."));
	}

	const body = Buffer.from(req.body.body_zip, "base64");
	const thumb = Buffer.from(req.body.thumbnail_large, "base64");
	if (!body.slice(0, 4).equals(
		Buffer.from([0x50, 0x4b, 0x03, 0x04])
	)) {
		console.warn("Controllers.movie#save attempted with invalid file.");
		res.statusCode = 400;
		return res.end(stringUtil.xmlError(400, "Movie is not a zip."));
	}

	console.log(`Controllers.movie#save: Saving movie #${req.body.movieId || "<new movie>"}...`);
	const xmlStream = nodezip.unzip(body)["movie.xml"].toReadStream();
	let buffers = [];
	xmlStream.on("data", (b) => buffers.push(b));
	xmlStream.on("end", () => {
		const xml = Buffer.concat(buffers);
		Movie.save(xml, thumb, req.body.movieId, saveAsStarter).then((id) => {
			console.log(`Controllers.movie#save: Successfully saved movie #${id}.`);
			res.end("0" + id);
		}).catch((err) => {
			if (typeof err.status !== "undefined" && err.status == 404) {
				console.warn("Controllers.movie#save attempted on nonexistent movie ID.");
				res.statusCode = 404;
				return res.end(stringUtil.xmlError(404, "Specified movie doesn't exist."));
			}
			console.error("Controllers.movie#save error:", err);
			res.statusCode = 500;
			res.end(stringUtil.xmlError(500, "Internal server error."));
		});
	});
});

module.exports = group;
