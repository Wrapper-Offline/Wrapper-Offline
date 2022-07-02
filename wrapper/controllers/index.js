/**
 * wrapper's routes
 */
// modules
const httpz = require("httpz");
// stuff
const app = require("./app");
const asset = require("./asset");
const char = require("./char");
const movie = require("./movie");
const theme = require("./theme");
const tts = require("./tts");
const discord = require("../utils/discord");

// create the group
const group = new httpz.Group();

group
	.route("*", "/", (req, res) => {
		discord("Video List");
		res.render("list", {});
	})
	// add all the routes
	.add(app)
	.add(asset)
	.add(char)
	.add(movie)
	.add(theme)
	.add(tts);

module.exports = group;
