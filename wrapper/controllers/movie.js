/**
 * movie routes
 */
// modules
const httpz = require("httpz");
// stuff
const database = require("../../data/database"), DB = new database();
const Movie = require("../models/movie");

// create the group
const group = new httpz.Group();

group
	// delete
	.route("GET", /\/api\/movie\/delete\/([^/]+)$/, async (req, res) => {
		const id = req.matches[1];

		console.log(`(Warning!) Deleting movie #${id}`);
		try {
			await Movie.delete(id);
			res.json({ status: "ok" });
		} catch (e) {
			console.error("This movie just won't die!", e);
			res.status(404);
			res.json({ status: "error" });
		}
	})
	// list
	.route("GET", "/api/movies/list", (req, res) => {
		res.json(DB.select("movies"));
	})
	// load
	.route(
		"*",
		["/goapi/getMovie/", /\/file\/movie\/file\/([^/]+)$/],
		async (req, res) => {
			const isGet = req.method == "GET";
			const id = isGet ?
				req.matches[1] :
				req.query.movieId;
			res.assert(id, 400, "");
			
			try {
				const buf = await Movie.load(id, isGet);
				res.setHeader("Content-Type", "application/zip");
				res.end(buf);
			} catch (e) {
				console.log("Error loading movie:", e);
				res.status(404);
				res.end();
			}
		}
	)
	// redirect
	.route("*", /\/videomaker\/full\/(\w+)\/tutorial$/, (req, res) => {
		const theme = req.matches[1];

		res.redirect(`/go_full?tray=${theme}&tutorial=0`);
	})

	// redirect
	.route("GET", "/dashboard/videos", (res) => {
		res.redirect(`/`);
	})
	// save
	//  #movies
	.route("POST", "/goapi/saveMovie/", async (req, res) => {
		res.assert(req.body.body_zip, 400, "1");
		const trigAutosave = req.body.is_triggered_by_autosave;
		res.assert(!(trigAutosave && !req.body.movieId), 200, "0");

		const body = Buffer.from(req.body.body_zip, "base64");
		const thumb = trigAutosave ?
			null : Buffer.from(req.body.thumbnail_large, "base64");

		const id = await Movie.save(body, thumb, req.body.movieId)
		res.end("0" + id);
	})
	//  #starter
	.route("POST", "/goapi/saveTemplate/", async (req, res) => {
		res.assert(req.body.body_zip, req.body.thumbnail_large, 400, "1");
		const body = Buffer.from(req.body.body_zip, "base64");
		const thumb = Buffer.from(req.body.thumbnail_large, "base64");

		const id = await Movie.save(body, thumb, req.body.movieId, true)
		res.end("0" + id);
	})
	// thumb
	.route("*", /\/file\/movie\/thumb\/([^/]+)$/, (req, res) => {
		const id = req.matches[1];

		const readStream = Movie.thumb(id);
		res.setHeader("Content-Type", "image/png");
		readStream.pipe(res); 
	});

module.exports = group;
