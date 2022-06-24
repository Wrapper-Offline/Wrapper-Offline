/**
 * wrapper's routes
 */
// modules
const httpz = require("httpz");
// stuff
const app = require("./app");

// create the group
const group = new httpz.Group();

group
    // add all the routes
    .route("GET", "/", async (req, res) => {
        res.render("list", {});
    })
    .add(app);

module.exports = group;
