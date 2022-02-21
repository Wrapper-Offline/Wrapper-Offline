const starter = require('./main');
module.exports = function (req, res, url) {
	if (req.method != 'GET' || !url.path.startsWith('/starter_thumbs')) return;
	starter.thumb(url.path.substr(url.path.lastIndexOf('/') + 1))
		.then(v => {
			res.setHeader('Content-Type', 'image/png');
			res.statusCode = 200; res.end(v);
		})
		.catch(() => {
			res.statusCode = 400; res.end();
		});
	return true;
}