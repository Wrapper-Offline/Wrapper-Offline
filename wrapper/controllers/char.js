/**
 * character routes
 */
// modules
const httpz = require("httpz");
// vars
const base = Buffer.alloc(1, "0");
// stuff
const Char = require("../models/char");

// create the group
const group = new httpz.Group();

group
	// load
	.route("POST", "/goapi/getCcCharCompositionXml/", (req, res) => {
		const id = req.body.assetId;
		res.assert(id, 400, "Missing one or more fields.");

		console.log(`Loading character #${id}...`);
		try {
			const buf = Char.load(id);
			res.setHeader("Content-Type", "application/xml");
			res.end(Buffer.concat([base, buf]));
		} catch (e) {
			console.log("But nobody came.");
			res.status(404);
			res.end("1");
		}
	})
	// premade
	.route("POST", "/goapi/getCCPreMadeCharacters", (req, res) => res.end())
	// redirect
	.route("GET", /\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/, (req, res) => {
		let [, theme, mode, id] = req.matches;
			
		let redirect;
		switch (mode) {
			case "/copy": {
				redirect = `/cc?themeId=${theme}&original_asset_id=${id.substring(1)}`;
				break;
			} default: {
				const type = req.query.type || defaultTypes[theme] || "";
				redirect = `/cc?themeId=${theme}&bs=${type}`;
				break;
			}
		}
		
		res.redirect(redirect);
	})
	// save
	.route("POST", "/goapi/saveCCCharacter/", (req, res) => {
		res.assert(
			req.body.body,
			req.body.thumbdata,
			req.body.themeId,
			400, "Missing one or more fields."
		);
		const body = Buffer.from(req.body.body);
		const thumb = Buffer.from(req.body.thumbdata, "base64");

		const meta = {
			type: "char",
			subtype: 0,
			title: "Untitled",
			themeId: req.body.themeId
		};
		const id = Char.save(body, meta);
		Char.saveThumb(id, thumb)
		res.end("0" + id);
	});

module.exports = group;
