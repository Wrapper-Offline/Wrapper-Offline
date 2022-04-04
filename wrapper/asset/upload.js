const formidable = require('formidable');
const sessions = require('../data/sessions');
const asset = require('./main');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/upload_asset/') return;
	new formidable.IncomingForm().parse(req, (e, f, files) => {
		const path = files.import.path, buffer = fs.readFileSync(path);
		const mId = sessions.get(req).movieId;

		const name = files.import.name;
		const suffix = name.substr(name.lastIndexOf('.'));
		asset.saveLocal(buffer, mId, suffix);
		fs.unlinkSync(path);
		res.end();
	});
	return true;
}