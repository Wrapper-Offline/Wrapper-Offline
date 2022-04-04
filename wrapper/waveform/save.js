/***
 * waveform save route
 */
const loadPost = require("../request/post_body");
const wf = require("./main");

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveWaveform/") return;
	loadPost(req, res).then(data => {
		const waveform = data.waveform, aId = data.wfid;
		wf.save(waveform, aId);
		res.end("0");
	});
	return true;
}