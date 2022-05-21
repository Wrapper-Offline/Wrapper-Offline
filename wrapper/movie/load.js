/**
 * route
 * movie loading
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
	let mId, isGet = false;
	switch (req.method) {
		case "GET": {
			const match = req.url.match(/\/file\/movie\/file\/([^/]+)$/);
			if (!match) return;
			mId = match[1];
			isGet = true;
			break;
		} case "POST": {
			if (!url.pathname.startsWith("/goapi/getMovie/")) return;
			else if (!url.query.movieId) {
				res.statusCode = 400;
				res.end();
				return true;
			}
			mId = url.query.movieId;
			break;
		} default: return;
	}

	try {
		const buf = await Movie.load(mId, isGet);
		res.setHeader("Content-Type", "application/zip");
		res.end(buf);
	} catch (err) {
		console.error(err);
		res.statusCode = 404;
		res.end();
	}
	return true;
}