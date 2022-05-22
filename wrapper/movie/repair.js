/**
 * route
 * movie repairing
 */
// stuff
const Movie = require("./main");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @returns {boolean}
 */
module.exports = async function (req, res) {
	const match = req.url.match(/\/api\/movie\/repair\/([^/]+)$/);
	if (!match) return;
	const mId = match[1];

	console.log("Repairing movie:", mId);
	try {
		await Movie.repair(mId);
		const url = `/go_full?movieId=${mId}`;
		// redirect the user
		res.statusCode = 302;
		res.setHeader("Location", url);
		res.end();
	} catch (e) {
		console.error("This movie is beyond repair.", e);
		res.statusCode = 404;
		res.setHeader("Content-Type", "application/json");
		res.end("{'status':'error'}");
	}
	return true;
}