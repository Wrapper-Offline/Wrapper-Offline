/**
 * Logs the response times.
 * @param {import("@octanuary/httpz".Request)} req
 * @param {import("@octanuary/httpz".Response)} res
 * @param {() => Promise<void>} next
 */
module.exports = async function resTime(req, res, next) {
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
