/**
 * route
 * movie thumbnails
 */
// stuff
const Movie = require("./main");

/**
 * Returns a movie thumbnail.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	const match = req.url.match(/\/file\/movie\/thumb\/([^/]+)$/);
	if (!match) return;
	const mId = match[1];

	try {
		const mThmb = await Movie.thumb(mId);
		res.setHeader("Content-Type", "image/png");
		res.end(mThmb);
	} catch (err) {
		res.statusCode = 404;
		res.end();
	}
	return true;
}