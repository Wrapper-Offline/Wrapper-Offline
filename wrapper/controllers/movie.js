/**
 * app routes
 */
// modules
const httpz = require("httpz");
// stuff
const Movie = require("../models/movie");

// create the group
const group = new httpz.Group();

group
	.route("POST", "/goapi/saveMovie/", async (req, res) => {
		res.assert(req.body.body_zip, 400, "1");
		const trigAutosave = req.body.is_triggered_by_autosave;
		res.assert(!(trigAutosave && !req.body.movieId), 200, "0");

		const body = Buffer.from(req.body.body_zip, "base64");
		const thumb = trigAutosave ?
			null : Buffer.from(req.body.thumbnail_large, "base64");

		const mId = await Movie.save(body, thumb, req.body.movieId)
		res.end("0" + mId);
	});

module.exports = group;
