const loadPost = require('../request/post_body');
const character = require('./main');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveCCCharacter/') return;
	loadPost(req, res).then(data => character.save(Buffer.from(data.body))).then(
		e => e ? res.end('10') : res.end('00'));
	return true;
}