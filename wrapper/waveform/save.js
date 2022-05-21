/**
 * route
 * waveform saving
 */
// stuff
const Wf = require("./main");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/saveWaveform/") return;
	else if (!req.body.waveform || !req.body.wfid) {
		res.statusCode = 400;
		res.end();
		return true;
	}
	const waveform = Buffer.from(req.body.waveform);
	const wfId = req.body.wfid;

	Wf.save(waveform, wfId);
	res.end("0");
	return true;
}