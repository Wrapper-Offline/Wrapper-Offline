/**
 * route
 * movie listing
 */
// stuff
const Movie = require("./main");

/**
 * Returns a list of movies and their metadata.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "GET" || url.pathname != "/movieList") return;

	try {
		Promise
			.all(Movie.list().map(async v => await Movie.meta(v))) // get movie meta instead
			.then(a => {
				// sort it from newest to oldest
				const sorted = a.sort((a, b) => new Date(b.date) - new Date(a.date));
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(sorted));
			});
	} catch (err) {
		if (process.env.NODE_ENV == "dev") throw err;
		console.error("Error listing movies: " + err)
		res.statusCode = 500;
		res.end("{[]}");
	}
	return true;
}