const loadPost = require('../request/post_body');
const character = require('./main');

module.exports = function (req, res) {
	switch (req.method) {
		case 'GET': {
			const match = req.url.match(/\/characters\/([^.]+)(?:\.xml)?$/);
			if (!match) return;

			var id = match[1];
			res.setHeader('Content-Type', 'text/xml');
			process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
			character.load(id).then(v => { res.statusCode = 200, res.end(v) })
				.catch(e => { res.statusCode = 404, res.end(e) })
			return true;
		}

		case 'POST': {
			if (req.url != '/goapi/getCcCharCompositionXml/') return;
			loadPost(req, res).then(async data => {
				console.log("Loading character: "+data.assetId||data.original_asset_id)
				res.setHeader('Content-Type', 'text/html; charset=UTF-8');
				process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
				character.load(data.assetId || data.original_asset_id)
					.then(v => { res.statusCode = 200, res.end(0 + v) })
					//.catch(e => { res.statusCode = 404, res.end(1 + e) })
					//why send a 404 when you can watch benson on youtube
					.catch(
						() => character.load('a-327068826')
						.then(v => {
							console.log("Couldn't find that character, but it's okay, we loaded Benson instead."),
							res.statusCode = 200, res.end(0 + v)
						})
					).catch(e => {
						console.log("But nobody came."),
						res.statusCode = 404, res.end(1 + e)
					});
			});
			return true;
		}
		default: return;
	}
}