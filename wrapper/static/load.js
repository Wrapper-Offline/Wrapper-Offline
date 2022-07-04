const stuff = require('./info');
const fs = require('fs');

module.exports = async function (req, res, url) {
	const methodLinks = stuff[req.method];
	const combLinks = Object.assign(stuff.ALL, methodLinks);
	for (let linkIndex in combLinks) {
		var regex = new RegExp(linkIndex);
		if (url.path.match(regex)) {
			var t = combLinks[linkIndex];
			var link = t.regexLink ? url.path.replace(regex, t.regexLink) : t.link || url.path;
			var headers = t.headers;
			var path = `./${link}`;

			try {
				for (var headerName in headers || {}) {
					res.setHeader(headerName, headers[headerName]);
				}
				res.statusCode = t.statusCode || 200;
				if (t.content !== undefined)
					res.end(t.content);
				else if (fs.existsSync(path))
					fs.createReadStream(path).pipe(res);
				else throw null;
			} catch (e) {
				return;
			}
			return true;
		}
	}
	return false;
};