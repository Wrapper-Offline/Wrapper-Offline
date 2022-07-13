/**
 * waveform routes
 */
// modules
const fs = require("fs");
const httpz = require("httpz");
const path = require("path");
// stuff
const database = require("../../data/database"), DB = new database(true);
const Wf = require("../models/waveform");

// create the group
const group = new httpz.Group();

group
	// load
	.route("POST", "/goapi/getWaveform/", async (req, res) => {
		const { SHOW_WAVEFORMS } = DB.select();
		if (SHOW_WAVEFORMS) {
			const id = req.body.wfid;
			res.assert(id, 500, "Missing one or more fields.");

			const waveform = Wf.load(id);
			waveform ? (res.statusCode = 200, res.end(waveform)) :
				(res.statusCode = 404, res.end());
		} else {
			const filepath = path.join(__dirname, "../data/waveform.txt");
			if (fs.existsSync(filepath)) {
				fs.createReadStream(filepath).pipe(res);
			} else {
				console.log("That's weird, data/waveform.txt doesn't seem to exist.");
				res.end("0");
			}
		}
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
