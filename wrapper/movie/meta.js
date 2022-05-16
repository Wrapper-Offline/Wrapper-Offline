/**
 * route
 * movie metadata
 */
// stuff
const Movie = require("./main");

/**
 * Returns a movie's metadata.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "GET" || !url.path.startsWith("/meta")) return;

	Movie.meta(url.path.substr(url.path.lastIndexOf("/") + 1))
		.then(v => res.end(JSON.stringify(v)))
		.catch(() => {
			res.statusCode = 404;
			res.end();
		});
	return true;
}