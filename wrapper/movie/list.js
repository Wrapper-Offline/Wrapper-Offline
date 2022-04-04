const movie = require('./main');
module.exports = function (req, res, url) {
	if (req.method != 'GET' || url.path != '/movieList') return;
	Promise.all(movie.list().map(movie.meta)).then(a => res.end(JSON.stringify(a)));
	return true;
}