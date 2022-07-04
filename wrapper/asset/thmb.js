const fs = require("fs");
const thumbUrl = process.env.THUMB_BASE_URL;

module.exports = async function (req, res, url) {
	if (req.method != 'GET' || !url.path.startsWith('/stock_thumbs')) return;
	res.end(fs.readFileSync(thumbUrl + url.path.substr(url.path.lastIndexOf('/'))));
	return true;
}