/**
 * start wrapper: offline's server
 */
// modules
const httpz = require("httpz");
const static = require("node-static");
// stuff
const routes = require("./controllers");
const resRender = require("./middlewares/res.render");

/**
 * create the server
 */
module.exports = function () {
	const server = new httpz.Server();
	const file = new static.Server("../server");
	
	server
		// add middlewares
		.add(resRender)
		// add routes
		.add(routes)
		// handle 404s
		.route("*", "*", async (req, res) => {
			if (!res.writableEnded) {
				req.addListener("end", () =>
					file.serve(req, res)
				).resume();
			}
		})
		.listen(process.env.SERVER_PORT, console.log("Wrapper: Offline has started."));
};
