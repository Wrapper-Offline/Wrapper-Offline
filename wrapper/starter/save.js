/***
 * starter save route
 */
const starter = require("./main");
const loadPost = require("../request/post_body");

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveTemplate/") return;
	loadPost(req, res).then(data => {
		var body = Buffer.from(data.body_zip, "base64");
		var thumb = Buffer.from(data.thumbnail_large, "base64");
		starter
			.save(body, thumb, data.movieId || null)
			.then(nId => res.end("0" + nId))
			.catch(err => {
				if (process.env.NODE_ENV == "dev") throw err;
				console.error("Error saving starter: " + err)
				res.end("1")
			});
	});
	return true;
}