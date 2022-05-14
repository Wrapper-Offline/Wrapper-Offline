/**
 * route
 * waveform saving
 */
// stuff
const Wf = require("./main");

module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/saveWaveform/") {
		return;
	} else if (!req.body.waveform || !req.body.wfid) {
		res.statusCode = 400;
		res.end();
		return;
	}
	const waveform = Buffer.from(req.body.waveform);
	const wfId = req.body.wfid;

	Wf.save(waveform, wfId);
	res.end("0");
	return true;
}