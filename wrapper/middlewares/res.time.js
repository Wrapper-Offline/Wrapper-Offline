const httpz = require("httpz");

/**
 * Logs the response times.
 * @param {httpz.Request} req 
 * @param {httpz.Response} res 
 * @param {Function} next 
 * @returns {void}
 */
module.exports = async function(req, res, next) {
	const start = Date.now();
	await next();
	const duration = Date.now() - start;
	console.log(`${req.method} ${req.url} - ${res.statusCode} ${duration}ms`);
};
