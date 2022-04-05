/***
 * waveform load route
 */
const loadPost = require("../request/post_body");
const wf = require("./main");

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/getWaveform/") return;
	loadPost(req, res).then(data => {
		const wfId = data.wfid + ".wf"

		const b = wf.load(wfId)
		b ? (res.statusCode = 200, res.end(b)) :
			(res.statusCode = 404, res.end());
	});
	return true;
}