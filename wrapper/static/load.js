const stuff = require('./info');
const fs = require('fs');

module.exports = function (req, res, url) {
	var methodLinks = stuff[req.method];
	for (let linkIndex in methodLinks) {
		var regex = new RegExp(linkIndex);
		if (regex.test(url.path)) {
			var t = methodLinks[linkIndex];
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
				res.statusCode = t.statusCode || 404;
				res.end();
			}
			return true;
		}
	}
	return false;
};