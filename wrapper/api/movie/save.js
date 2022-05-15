/**
 * route
 * movie saving
 */
// stuff
const movie = require("./main");

/**
 * Saves a movie XML.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/saveMovie/")
		return;
	const trigAutosave = req.body.is_triggered_by_autosave;
	if (!req.body.body_zip) {
		res.statusCode = 400;
		res.end();
		return;
	} else if (trigAutosave && !req.body.movieId)  {
		// more validation
		res.end("0");
		return;
	}
	const body = Buffer.from(req.body.body_zip, "base64");
	const thumb = trigAutosave ? null : Buffer.from(req.body.thumbnail_large, "base64");

	movie
		.save(body, thumb, req.body.movieId || null)
		.then(nId => res.end("0" + nId))
		.catch(err => {
			if (process.env.NODE_ENV == "dev") throw err;
			console.error("Error saving movie: " + err);
			res.end("1");
		});
	return true;
}