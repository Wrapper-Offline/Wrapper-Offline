const loadPost = require('../request/post_body');
const starter = require('./main');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveTemplate/') return;
	loadPost(req, res).then(data => {

		var body = Buffer.from(data.body_zip, 'base64');
		var thumb = data.thumbnail_large && Buffer.from(data.thumbnail_large, 'base64');
		starter.save(body, thumb).then(nId => res.end('0' + nId));
	});
	return true;
}