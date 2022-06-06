/**
 * route
 * character redirects
 */
const defaultTypes = {
	family: "adam",
	anime: "guy"
};

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "GET") return;
	const match = url.pathname.match(/\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/);
	if (!match) return;
	let [, theme, mode, id] = match;

	let redirect;
	switch (mode) {
		case "/copy": {
			redirect = `/cc?themeId=${theme}&original_asset_id=${id.substring(1)}`;
			break;
		} default: {
			const type = url.query.type || defaultTypes[theme] || "";
			redirect = `/cc?themeId=${theme}&bs=${type}`;
			break;
		}
	}
	res.setHeader("Location", redirect);
	res.statusCode = 302;
	res.end();
	return true;
};
