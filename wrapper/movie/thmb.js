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
	if (req.method != "GET" || !url.pathname.startsWith("/file/movie/thumb/")) return;
	const mId = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);
	if (!mId || mId == "") {
		res.statusCode = 400;
		res.end();
		return;
	}

	try {
		const mThmb = await Movie.thumb(mId);
		res.statusCode = 200;
		res.setHeader("Content-Type", "image/png");
		res.end(mThmb);
	} catch (err) {
		res.statusCode = 404;
		res.end();
		return;
	}
	return true;
}