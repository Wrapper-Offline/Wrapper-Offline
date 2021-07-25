const sessions = require('./data/sessions');
const start = '/events/';
module.exports = function (req, res, url) {
	if (!url.path.startsWith(start)) return;
	switch (url.path.substr(start.length)) {
		case 'close': {
			sessions.remove(req);
			break;
		}
		default: {
			res.end();
			return false;
		};
	}
	res.end();
	return true;
}