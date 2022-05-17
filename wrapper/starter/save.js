/**
 * route
 * starter saving
 */
// stuff
const Starter = require("./main");

/**
 * Saves a starter XML.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/saveTemplate/") return;
	else if (!req.body.body_zip || !req.body.thumbnail_large) {
		res.statusCode = 400;
		res.end();
		return true;
	}
	const body = Buffer.from(req.body.body_zip, "base64");
	const thumb = Buffer.from(req.body.thumbnail_large, "base64");

	try {
		const mId = await Starter.save(body, thumb, req.body.movieId)
		res.end("0" + mId);
	} catch (err) {
		if (process.env.NODE_ENV == "dev") throw err;
		console.error("Error saving starter: " + err);
		res.statusCode = 500;
		res.end("1")
	}
	return true;
}