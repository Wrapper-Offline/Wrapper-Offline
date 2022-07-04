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
		// check if the mid is valid
		if (mId.length != 7) throw "fuck off";
		await Movie.repair(mId);
		res.setHeader("Content-Type", "application/json");
		res.end('{"status":"ok"}');
	} catch (e) {
		console.error("This movie is beyond repair.", e);
		res.statusCode = 404;
		res.setHeader("Content-Type", "application/json");
		res.end('{"status":"error"}');
	}
	return true;
}
