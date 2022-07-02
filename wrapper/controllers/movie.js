/**
 * app routes
 */
// modules
const httpz = require("httpz");
// stuff
const database = require("../utils/database"), DB = new database();
const Movie = require("../models/movie");

// create the group
const group = new httpz.Group();

group
	// list
	.route("GET", "/api/movies/list", (req, res) => {
		res.json(DB.select("movies"));
	})
	// save
	.route("POST", "/goapi/saveMovie/", async (req, res) => {
		res.assert(req.body.body_zip, 400, "1");
		const trigAutosave = req.body.is_triggered_by_autosave;
		res.assert(!(trigAutosave && !req.body.movieId), 200, "0");

		const body = Buffer.from(req.body.body_zip, "base64");
		const thumb = trigAutosave ?
			null : Buffer.from(req.body.thumbnail_large, "base64");

		const mId = await Movie.save(body, thumb, req.body.movieId)
		res.end("0" + mId);
	})
	// thumb
	.route("*", /\/file\/movie\/thumb\/([^/]+)$/, (req, res) => {
		const id = req.matches[1];

		const readStream = Movie.thumb(id);
		res.setHeader("Content-Type", "image/png");
		readStream.pipe(res); 
	});

module.exports = group;
