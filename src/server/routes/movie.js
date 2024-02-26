const fs = require("fs");
const httpz = require("@octanuary/httpz");
const database = require("../../data/database.js");
const MovieModel = require("../models/movie.js");
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
group.route("GET", "/dashboard/videos", (req, res) => {
	res.redirect("/");
});

/*
thumbs
*/
group.route("*", /\/file\/movie\/thumb\/([^/]+)$/, (req, res) => {
	const id = req.matches[1];

	try {
		const readStream = MovieModel.thumb(id);
		res.setHeader("Content-Type", "image/png");
		readStream.pipe(res); 
	} catch (err) {
		if (err == "404") {
			return res.status(404).end();
		}
		console.log(req.parsedUrl.pathname, "failed. Error:", err);
		res.status(500).end();
	}
});

/*
info
*/
group.route("GET", "/api/movie/get_info", (req, res) => {
	const id = req.query.id;
	if (!id) {
		return res.status(400).json({msg:"Movie ID missing."});
	}

	const movie = database.instance.get("movies", id)
	if (movie) {
		res.json(movie.data);
	} else {
		res.status(404).json({msg:"Movie not found."});
	}
});

/*
list
*/
// list page
group.route("*", "/", (req, res) => {
	res.render("list", {});
});
// movies
group.route("GET", "/api/movie/list", (req, res) => {
	if (!req.query.type) {
		return res.status(400).json({msg:"No type specified."});
	}
	switch (req.query.type) {
		case "starter":
			return res.json(database.instance.select("assets", { type: "movie" }));
		case "movie":
		default:
			return res.json(database.instance.select("movies"));
	}
});

/*
delete
*/
group.route("GET", /\/api\/movie\/delete\/([^/]+)$/, async (req, res) => {
	const id = req.matches[1];
	console.log(`${req.parsedUrl.pathname}: Deleting movie #${id}...`);
	MovieModel.delete(id).then(() => {
		console.log(`${req.parsedUrl.pathname}: Successfully deleted movie #${id}.`);
		res.end();
	}).catch((err) => {
		if (err == "404") {
			return res.status(404).json({ msg: "Movie doesn't exist." });
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", err);
		res.status(500).json({ msg: "Internal server error." });
	});
});

/*
upload
*/
group.route("POST", "/api/movie/upload", (req, res) => {
	const file = req.files.import;
	const isStarter = req.body.is_starter;
	if (typeof file == "undefined") {
		return res.status(400).json({ msg: "No file." });
	}

	const path = file.filepath, buffer = fs.readFileSync(path);
	if (
		file.mimetype !== "application/x-zip-compressed" &&
		file.mimetype !== "application/zip" &&
		!buffer.subarray(0, 4).equals(
			Buffer.from([0x50, 0x4b, 0x03, 0x04])
		)
	) {
		return res.status(400).json({ msg: "Movie is not a zip." });
	}

	MovieModel.upload(buffer, isStarter).then((id) => {
		fs.unlinkSync(path);
		res.json({ id: id });
	}).catch((err) => {
		console.error("Controllers.movie#upload error:", err);
		res.status(500).json({ msg: null });
	});
});

/*
pack
*/
group.route(
	"*",
	/^\/file\/movie\/file\/([^/]+)|\/goapi\/getMovie\/$/,
	(req, res) => {
		const isPost = req.method == "POST";
		const id = req.body.movieId = isPost ?
			req.query.movieId :
			req.matches[1];
		if (typeof id == "undefined") {
			return res.status(400).end("ID not specified.");
		}

		MovieModel.packMovie(id).then((zipped) => {
			if (isPost) {
				zipped = Buffer.concat([Buffer.alloc(1, 0), zipped]);
			}
			res.setHeader("Content-Type", "application/zip");
			res.end(zipped);
		}).catch((err) => {
			if (err == "404") {
				return res.status(404).end("Movie doesn't exist.");
			}
			console.error("Controllers.movie#pack error:", err);
			res.status(500).end("Internal server error.");
		});
	}
);

/*
save
*/
group.route("POST", ["/goapi/saveMovie/", "/goapi/saveTemplate/"], (req, res) => {
	if (!req.body.body_zip) {
		return res.status(400).end("No movie zip.");
	}
	const trigAutosave = req.body.is_triggered_by_autosave;
	const saveAsStarter = req.parsedUrl.pathname == "/goapi/saveTemplate/";
	// make sure we're autosaving an existing movie
	if (trigAutosave && !req.body.movieId) {
		return res.end("0");
	} else if ( // check if there's a thumbnail in case this is a manual save
		!trigAutosave && !req.body.thumbnail_large
	) {
		return res.status(400).end("A thumbnail is required on manual saves.");
	}

	const body = Buffer.from(req.body.body_zip, "base64");
	let thumb;
	if (!trigAutosave) {
		thumb = Buffer.from(req.body.thumbnail_large, "base64");
	}
	if (!body.subarray(0, 4).equals(
		Buffer.from([0x50, 0x4b, 0x03, 0x04])
	)) {
		return res.status(400).end("Movie is not a zip.");
	}

	console.log(`Controllers.movie#save: Saving movie #${req.body.movieId || "<new movie>"}...`);
	// extract the xml from the BLANK ZIP YOU FUCKERS
	// YOU GOANIMATE HACKS
	const xmlStream = nodezip.unzip(body)["movie.xml"].toReadStream();
	let buffers = [];
	xmlStream.on("data", (c) => buffers.push(c));
	xmlStream.on("end", () => {
		const xml = Buffer.concat(buffers);
		MovieModel.save(xml, thumb, req.body.movieId, saveAsStarter).then((id) => {
			console.log(`Controllers.movie#save: Successfully saved movie #${id}.`);
			res.end("0" + id);
		}).catch((err) => {
			if (err == "404") {
				return res.status(404).end("Specified movie doesn't exist.");
			}
			console.error("Controllers.movie#save error:", err);
			res.status(500).end("Internal server error.");
		});
	});
});

module.exports = group;
