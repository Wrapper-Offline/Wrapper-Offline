/**
 * route
 * waveform loading
 */
// stuff
const Wf = require("./main");

/**
 * Loads a waveform file.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/getWaveform/") {
		return;
	} else if (!req.body.wfid) {
		res.statusCode = 400;
		res.end();
		return;
	}
	const wfId = req.body.wfid;

	const waveform = Wf.load(wfId);
	waveform ? (res.statusCode = 200, res.end(waveform)) :
		(res.statusCode = 404, res.end());
	return true;
}