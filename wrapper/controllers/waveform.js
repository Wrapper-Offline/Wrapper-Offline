/**
 * waveform routes
 */
// modules
const httpz = require("httpz");
// stuff
const Wf = require("../models/waveform");

// create the group
const group = new httpz.Group();

group
	// load
	.route("POST", "/goapi/getWaveform/", async (req, res) => {
		const id = req.body.wfid;
		res.assert(id, 500, "Missing one or more fields.");

		const waveform = Wf.load(id);
		waveform ? (res.statusCode = 200, res.end(waveform)) :
			(res.statusCode = 404, res.end());
	})
	// save
	.route("POST", "/goapi/saveWaveform/", (req, res) => {
		const { waveform } = req.body;
		const id = req.body.wfid;
		res.assert(id, waveform, 500, "Missing one or more fields.");

		Wf.save(waveform, id);
		res.end("0");
	});

module.exports = group;
