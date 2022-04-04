/***
 * character save route
 */
const loadPost = require("../request/post_body");
const char = require("./main");

module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.path) {
		case "/goapi/saveCCCharacter/": { // save all
			loadPost(req, res).then(data => {
				// check for missing data
				if (!data.body || !data.thumbdata || !data.themeId) res.statusCode = 400, res.end(JSON.stringify({ status: "forbidden", msg: "missing char data" }))
				const meta = {
					type: "char",
					subtype: 0,
					title: "Untitled",
					ext: "xml",
					tId: data.themeId
				};
				try {
					const id = char.save(Buffer.from(data.body), meta);
					char.saveThumb(Buffer.from(data.thumbdata, "base64"), id);
					res.end("1" + id);
				} catch (err) {
					console.error("Error saving character: " + err);
					res.statusCode = 500;
					res.end("00");
				}
			});
			return true;
			break;
		}
		case "/goapi/saveCCThumbs/": { // fake saving stock thumbnails
			res.end(00)
			return true;
			break;
		}
		default:
			return;
	}
}