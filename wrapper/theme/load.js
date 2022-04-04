const loadPost = require('../request/post_body');
const folder = process.env.THEME_FOLDER;
const fUtil = require('../fileUtil');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getTheme/') return;
	loadPost(req, res).then(data => {
		var theme = data.themeId;
		switch (theme) {
			case 'family':
				theme = 'custom';
				break;
		}
		res.setHeader('Content-Type', 'application/zip');
		fUtil.zippy(`${folder}/${theme}.xml`, 'theme.xml').then(b => res.end(b));
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	});
	return true;
}