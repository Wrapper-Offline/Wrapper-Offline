const loadPost = require('../request/post_body');
const header = process.env.XML_HEADER;
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const base = Buffer.alloc(1, 0);
const asset = require('./main');

async function listAssets(data, makeZip) {
	var xmlString, files;
	switch (data.type) {
		case 'char': {
			const chars = await asset.chars(data.themeId);
			xmlString = `${header}<ugc more="0">${chars.map(v => `<char id="${v.id}" name="Untitled" cc_theme_id="${
				v.theme}" thumbnail_url="char_default.png" copyable="Y"><tags/></char>`).join('')}</ugc>`;
			break;
		}
		case 'bg': {
			files = asset.getBackgrounds();
			xmlString = `${header}<ugc more="0">${files.map(v => `<bg id="${v.id}"/>`)}</ugc>`;
			break;
		}
		case 'prop':
		default: {
			xmlString = `${header}<ugc more="0"></ugc>`;
			break;
		}
	};

	if (makeZip) {
		const zip = nodezip.create();
		fUtil.addToZip(zip, 'desc.xml', Buffer.from(xmlString));

		switch (data.type) {
			case 'bg': {
				for (let c = 0; c < files.length; c++) {
					const file = files[c];
					fUtil.addToZip(zip, `bg/${file.id}`, asset.loadLocal(file.id));
				}
				break;
			}
		};
		return Buffer.concat([base, await zip.zip()]);
	}
	else
		return Buffer.from(xmlString);
}

module.exports = function (req, res, url) {
	var makeZip = false; switch (url.path) {
		case '/goapi/getUserAssets/': makeZip = true; break;
		case '/goapi/getUserAssetsXml/': break;
		default: return;
	}

	switch (req.method) {
		case 'GET': {
			listAssets(url.query, makeZip).then(buff => {
				const type = makeZip ? 'application/zip' : 'text/xml';
				res.setHeader('Content-Type', type), res.end(buff);
			});
			return true;
		}
		case 'POST': {
			loadPost(req, res).then(data => listAssets(data, makeZip)).then(buff => {
				const type = makeZip ? 'application/zip' : 'text/xml';
				res.setHeader('Content-Type', type), res.end(buff);
			});
			return true;
		}
		default: return;
	}


}