const httpz = require("@octanuary/httpz");
const https = require("https");
const database = require("../../data/database"), DB = new database(true);
const group = new httpz.Group();

/*
list
*/
group.route("GET", "/api/settings/list", (req, res) => {
	res.json(DB.select());
});

/*
upload
*/
group.route("POST", "/api/settings/update", (req, res) => {
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

/*
check for updates
*/
group.route("GET", "/api/settings/get_updates", (req, res) => {
	const handleError = (err) => {
		console.log("Error checking for updates:", err);
		res.statusCode = 500;
		res.end();
	};
	https.get(
		{
			host: "api.github.com",
			path: "/repos/Wrapper-Offline/Wrapper-Offline/tags",
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"
			}
		},
		(res2) => {
			let buffers = [];
			res2.on("data", (c) => buffers.push(c));
			res2.on("end", () => {
				const buffer = Buffer.concat(buffers);
				let json;
				try {
					json = JSON.parse(buffer.toString());
				} catch (err) {
					console.log("Error parsing JSON while checking for updates:", err);
					console.log("Response:", buffer.toString());
					res.statusCode = 400;
					res.end();
				}

				const latest = json[0].name;
				if (
					+(latest.substring(1).replace(/\./, "")) >
					+(process.env.WRAPPER_VER.replace(/\./, ""))
				) {
					res.json({ updates_available: true, tag_name: latest });
				} else {
					res.json({ updates_available: false });
				}
			});
			res2.on("error", handleError);
		}
	).on("error", handleError);
});

module.exports = group;
