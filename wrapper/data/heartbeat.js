const sessions = require('./sessions');
module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/heartbeat/v1/') return;
	res.end(`{"health":"0","locked":"${sessions.getCount(req) > 1 ? 1 : 0}"}`);
	return true;
}