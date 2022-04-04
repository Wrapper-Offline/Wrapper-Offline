const loadPost = require('../request/post_body');
const header = process.env.XML_HEADER;
const asset = require('./main');

async function listAssets(data) {
	var response, files;
	switch (data.type) {
		case "char": {
			var themeId;
			switch (data.themeId) { // fix theme id
				case "custom": {
					themeId = "family";
					break;
				}
				case "action": {
					themeId = "cc2";
					break;
				}
				default: {
					themeId = data.themeId;
					break;
				}
			}
			files = asset.list("char", 0, themeId);
			response = `${header}<ugc more="0">${files
				.map(v => `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" cc_theme_id="${v.themeId}" thumbnail_url="/assets/${v.id}.png" copyable="Y"><tags>${v.tags}</tags></char>`)
				.join("")}</ugc>`;
			break;
		}
		case "bg": {
			files = asset.list("bg");
			response = {
				"status": "ok",
				"data": {
					"xml": `${header}<ugc more="0">${files
						.map(v => `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/assets/${v.id}"/>`)
						.join("")}</ugc>`
				}
			};
			break;
		}
		case "movie": {
			files = asset.list("movie");
			response = {
				"status": "ok",
				"data": {
					"xml": `${header}<ugc more="0">${files
						.map(v => `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="1" title="${v.name}" thumbnail_url="/assets/${v.id}.png"><tags></tags></movie>`)
						.join("")}</ugc>`
				}
			};
			break;
		}
		case "prop": {
			if (data.subtype) {
				files = asset.list("prop", "video");
				response = {
					"status": "ok",
					"data": {
						"xml": `${header}<ugc more="0">${files
							.map(v => `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.id}"/>`)
							.join("")}</ugc>`
					}
				};
			} else {
				files = asset.list("prop");
				response = {
					"status": "ok",
					"data": {
						"xml": `${header}<ugc more="0">${files
							.map(v => `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.id}"/>`)
							.join("")}<folder id="fidogd" name="DIE"/></ugc>`
					}
				};
			}
			break;
		}
		case "sound": {
			files = asset.list("sound");
			response = {
				"status": "ok",
				"data": {
					"xml": `${header}<ugc more="0">${files
						.map(v => `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`)
						.join("")}</ugc>`
				}
			};
			break;
		}
		default: { // no type? send a blank response
			response = {
				"status": "ok",
				"data": {
					"xml": `${header}<ugc more="0"></ugc>`
				}
			};
			break;
		}
	};
	return response;
}

module.exports = function (req, res, url) {
	switch (url.path) {
		case "/api_v2/assets/team":
		case "/api_v2/assets/shared":
		case "/api_v2/assets/imported": {
			loadPost(req, res).then(data => listAssets(data.data)).then(a => {
				res.setHeader("Content-Type", "application/json"), res.end(JSON.stringify(a));
			});
			return true;
			break;
		}
		case "/goapi/getUserAssetsXml/": {
			loadPost(req, res).then(data => listAssets(data)).then(a => {
				res.setHeader("Content-Type", "text/html; charset=UTF-8"), res.end(a);
			});
			return true;
			break;
		}
		default:
			return;
	}
}