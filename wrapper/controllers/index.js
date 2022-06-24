/**
 * wrapper's routes
 */
// modules
const httpz = require("httpz");
// stuff
const app = require("./app");
const theme = require("./theme");

// create the group
const group = new httpz.Group();

group
	// add all the routes
	.route("GET", "/", (req, res) =>
		res.render("list", {}))
	.add(app)
	.add(theme);

module.exports = group;
