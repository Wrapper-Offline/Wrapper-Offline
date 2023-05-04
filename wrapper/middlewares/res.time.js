const httpz = require("@octanuary/httpz");

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
	// filter static requests
	switch (req.parsedUrl.pathname.substring(1, 4) || "home") {
		case "goa":
		case "api":
			const body = "  " + JSON.stringify({
				assetId: req.body?.assetId ||
					req.body?.data?.id ||
					req.body?.data?.starter_id,
				is_starter: req.body?.is_starter,
				movieId: req.body?.movieId,
				themeId: req.body?.themeId,
				voiceId: req.body?.voice
			});
			if (body !== "  {}") console.log(body);
			break;
	}
};
