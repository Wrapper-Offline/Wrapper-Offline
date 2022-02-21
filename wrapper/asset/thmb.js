const thumbUrl = process.env.THUMB_BASE_URL;
const get = require('../request/get');

module.exports = function (req, res, url) {
	if (req.method != 'GET' || !url.path.startsWith('/stock_thumbs')) return;
	get(thumbUrl + url.path.substr(url.path.lastIndexOf('/'))).then(v => res.end(v));
	return true;
}