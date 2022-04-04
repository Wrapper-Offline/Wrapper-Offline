const formidable = require('formidable');
const parse = require('../data/parse');
const fUtil = require('../fileUtil');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/upload_movie') return;
	new formidable.IncomingForm().parse(req, (e, f, files) => {
		const path = files.import.path, buffer = fs.readFileSync(path);
		const numId = fUtil.getNextFileId('movie-', '.xml');
		parse.unpackXml(buffer, numId);
		fs.unlinkSync(path);

		res.statusCode = 302;
		const url = `/go_full?movieId=m-${numId}`;
		res.setHeader('Location', url);
		res.end();
	});
	return true;
}