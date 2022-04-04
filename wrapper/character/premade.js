const loadPost = require('../request/post_body');
const folder = process.env.PREMADE_FOLDER;
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getCCPreMadeCharacters') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'text/html; charset=UTF-8');
		const p = `${folder}/${data.themeId}.xml`;
		fs.createReadStream(p).pipe(res);
	});
	return true;
}