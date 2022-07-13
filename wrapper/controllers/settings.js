/**
 * setting routes
 */
// modules
const httpz = require("httpz");
// stuff
const database = require("../../data/database"), DB = new database(true);

// create the group
const group = new httpz.Group();

group
	// list
	.route("GET", "/api/settings/list", (req, res) => {
		res.json(DB.select());
	})
	// update
	.route("POST", "/api/settings/update", (req, res) => {
		const { setting } = req.body;
		// convert true or false to a boolean
		const value = req.body.value == "true" ? true : 
			req.body.value == "false" ? false : req.body.value;
		res.assert(
			setting,
			typeof value != "undefined",
			400, { status: "error" }
		);

		const db = DB.select();
		// check if the setting exists
		res.assert(setting in db, 400, { status: "error" });

		db[setting] = value;
		DB.save(db);
		res.json({ status: "ok" });
	});

module.exports = group;
