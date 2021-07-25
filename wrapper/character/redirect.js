const http = require("http");
const defaultTypes = {
	family: "adam",
	anime: "guy",
};

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.pathname.startsWith("/go/character_creator")) return;
	var match = /\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/.exec(url.pathname);
	if (!match) return;
	[, theme, mode, id] = match;

	var redirect;
	switch (mode) {
		case "/copy": {
			redirect = `/cc?themeId=${theme}&original_asset_id=${id.substr(1)}`;
			break;
		}
		default: {
			var type = url.query.type || defaultTypes[theme] || "";
			redirect = `/cc?themeId=${theme}&bs=${type}`;
			break;
		}
	}
	res.setHeader("Location", redirect);
	res.statusCode = 302;
	res.end();
	return true;
};
