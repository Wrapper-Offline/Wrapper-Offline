/**
 * character routes
 */
// modules
const httpz = require("httpz");
// stuff
const Char = require("../models/char");

// create the group
const group = new httpz.Group();

group
	.route("POST", "/goapi/getCCPreMadeCharacters", (req, res) => res.end())
	.route("GET", /\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/, async (req, res) => {
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
	.route("POST", "/goapi/saveCCCharacter/", async (req, res) => {
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
	})

module.exports = group;
