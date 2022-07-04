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
	const { wfid: wfId } = req.body;
	if (!wfId) {
		res.statusCode = 400;
		res.end();
		return true;
	}

	const waveform = Wf.load(wfId);
	waveform ? (res.statusCode = 200, res.end(waveform)) :
		(res.statusCode = 404, res.end());
	return true;
}