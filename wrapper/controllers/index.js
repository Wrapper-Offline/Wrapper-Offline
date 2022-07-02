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
const discord = require("../utils/discord");

// create the group
const group = new httpz.Group();

group
	// add all the routes
	.route("*", "/", (req, res) => {
		discord("Video List");
		res.render("list", {});
	})
	.add(app)
	.add(asset)
	.add(char)
	.add(movie)
	.add(theme);

module.exports = group;
