/**
 * route
 * waveform loading
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
	if (req.method != "POST" || url.pathname != "/goapi/getWaveform/") return;
	else if (!req.body.wfid) {
		res.statusCode = 400;
		res.end();
		return true;
	}
	const wfId = req.body.wfid;

	const waveform = Wf.load(wfId);
	waveform ? (res.statusCode = 200, res.end(waveform)) :
		(res.statusCode = 404, res.end());
	return true;
}