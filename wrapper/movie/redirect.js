/**
 * route
 * movie redirects
 */

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "GET") return;
	const match = url.pathname.match(/\/videomaker\/full\/(\w+)\/tutorial$/);
	if (!match) return;
	const theme = match[1];
	
	const redirect = `/go_full?tray=${theme}&tutorial=0`;
	res.setHeader("Location", redirect);
	res.statusCode = 302;
	res.end();
	return true;
};
