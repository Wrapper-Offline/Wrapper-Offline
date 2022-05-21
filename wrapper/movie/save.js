/**
 * route
 * movie saving
 */
// stuff
const Movie = require("./main");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/saveMovie/") return;
	else if (!req.body.body_zip) {
		res.statusCode = 400;
		res.end();
		return true;
	}
	const trigAutosave = req.body.is_triggered_by_autosave;
	if (trigAutosave && !req.body.movieId) return res.end("0");
	const body = Buffer.from(req.body.body_zip, "base64");
	const thumb = trigAutosave ? null : Buffer.from(req.body.thumbnail_large, "base64");

	try {
		const mId = await Movie.save(body, thumb, req.body.movieId)
		res.end("0" + mId);
	} catch (err) {
		if (process.env.NODE_ENV == "dev") throw err;
		console.error("Error saving movie: " + err);
		res.statusCode = 500;
		res.end("1")
	}
	return true;
}