const formidable = require("formidable");
const httpz = require("httpz");

/**
 * request body
 * @param {httpz.Request} req
 * @param {httpz.Response} res
 * @param {Function} next 
 * @returns {void}
 */
module.exports = async function reqBody(req, res, next) {
	req.body = {};
	if (req.method == "POST")
		await new Promise((resolve, reject) =>
			new formidable.IncomingForm().parse(req, async (e, f, files) => {
				req.body = f;
				req.files = files;
				resolve();
			}
		));
	next();
};
