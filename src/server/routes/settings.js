const httpz = require("@octanuary/httpz");
const https = require("https");
const settings = require("../../data/settings.js").instance;

const group = new httpz.Group();

/*
page
*/
group.route("*", "/settings", (req, res) => {
	res.render("settings", {});
});

/*
list
*/
group.route("GET", "/api/settings/list", (req, res) => {
	res.json(settings.getAllSettings());
});

/*
update
*/
group.route("POST", "/api/settings/update", (req, res) => {
	/** @type {String} >} */
	const name = req.body.setting;
	if (!name) {
		return res.status(400).json({msg:"Expected parameter 'setting' on the request body."});
	}
	if (!req.body.value) {
		return res.status(400).json({msg:"Expected parameter 'value' on the request body."});
	}
	// convert true or false to a boolean, or use the original value if it's neither
	/** @type {string | boolean} */
	const value = req.body.value == "true" ? true : 
		req.body.value == "false" ? false : req.body.value;

	// check if the setting exists
	// this miight be a bad way to program it but i like how it looks
	if (!settings[name] || name == "getAllSettings") {
		console.warn(`r.settings: Attempted #update on invalid setting '${name}'.`);
		return res.status(400).json({msg:`Expected parameter 'value' for setting '${name}' to have type '${typeof settings[name]}'.`});
	}
	if (typeof settings[name] != typeof value) {
		console.warn(`r.settings: Attempted #update on setting '${name}' with type '${typeof value}'. Expected '${typeof settings[name]}'.`);
		return res.status(400).json({msg:`Expected parameter 'value' for setting '${name}' to have type '${typeof settings[name]}'.`});
	}
	settings[name] = value;

	res.end();
});

/*
check for updates
*/
// TODO: move this to the client side
// because wtf is this shit?? like what??? tf??
group.route("GET", "/api/settings/get_updates", (req, res) => {
	const handleError = (err) => {
		console.log("Error checking for updates:", err);
		return res.status(500).end();
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
					return res.status(400).end();
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
