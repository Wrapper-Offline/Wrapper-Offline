const formidable = require("formidable");

/**
 * request body parser
 * @param {import("@octanuary/httpz".Request)} req
 * @param {import("@octanuary/httpz".Response)} res
 * @param {() => Promise<void>} next
 */
module.exports = async function reqBody(req, res, next) {
	req.body = {};
	if (req.method == "POST")
		await new Promise((resolve, reject) =>
			new formidable.IncomingForm().parse(req, async (e, f, files) => {
				req.body = f;
				req.files = files;
				resolve(null);
			}
		));
	next();
};
