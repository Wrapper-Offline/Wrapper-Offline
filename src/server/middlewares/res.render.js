const { Eta } = require("eta");
const { join } = require("path");

const eta = new Eta({ views: join(__dirname, "../views") });

/**
 * renders a view using eta
 * @param {import("@octanuary/httpz".Request)} req
 * @param {import("@octanuary/httpz".Response)} res
 * @param {() => Promise<void>} next
 */
module.exports = function resRender(req, res, next) {
	/**
	 * @param {string} filename 
	 * @param {object} data 
	 * @param {?{filepath:string}} config 
	 */
	res.render = async function render(filename, data, config) {
		let object = { env: process.env };
		Object.assign(object, data);

		const file = Buffer.from(await eta.renderAsync(filename, object, config));
		res.end(file);
	};
	next();
};
