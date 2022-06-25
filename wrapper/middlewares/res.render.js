const eta = require("eta");
const httpz = require("httpz");
const path = require("path");

/**
 * Renders a view using Eta.js.
 * @param {httpz.Request} req
 * @param {httpz.Response} res
 * @param {Function} next 
 * @returns {void}
 */
module.exports = function resRender(req, res, next) {
    res.render = async (filename, data, config) => {
        const filepath = path.join(__dirname, "../views", filename);

        let object = { env: process.env };
        Object.assign(object, data);

		const file = Buffer.from(await eta.renderFile(filepath, object, config));
		res.end(file);
    };
    next();
};
