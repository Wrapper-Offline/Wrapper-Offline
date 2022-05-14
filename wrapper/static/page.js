const eta = require("eta");

function toAttrString(table) {
	return typeof (table) == 'object' ? new URLSearchParams(table).toString() : table.replace(/"/g, "\\\"");
}
function toParamString(table) {
	return Object.keys(table).map(key =>
		`<param name="${key}" value="${toAttrString(table[key])}">`
	).join(' ');
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs).map(key =>
		`${key}="${attrs[key].replace(/"/g, "\\\"")}"`
	).join(' ')}>${toParamString(params)}</object>`;
}

module.exports = async function (req, res, url) {
	if (req.method != 'GET') return;
	const query = url.query;

	// parse urls for the lvm
	const SWF_URL = process.env.SWF_URL.replace("127.0.0.1", "localhost");
	const STORE_URL = process.env.STORE_URL.replace("127.0.0.1", "localhost");
	const CLIENT_URL = process.env.CLIENT_URL.replace("127.0.0.1", "localhost");
	var attrs, params, title, filename;
	switch (url.pathname) {
		case "/cc": {
			title = "Character Creator";
			filename = "char";
			attrs = {
				data: SWF_URL + "/cc.swf", // data: "cc.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "960", 
				height: "600", 
				style:"display:block;margin-left:auto;margin-right:auto;",
			};
			params = {
				flashvars: {
					"original_asset_id": query["id"] || "",
					"themeId": "family",
					"ut": 60,
					"bs": "adam",
					"appCode": "go",
					"page": "",
					"siteId": "go",
					"m_mode": "school",
					"isLogin": "Y",
					"isEmbed": 1,
					"ctc": "go",
					"tlang": "en_US",
					"apiserver": "/",
					"storePath": STORE_URL + "/<store>",
					"clientThemePath": CLIENT_URL + "/<client_theme>"
				},
				allowScriptAccess: "always",
				movie: SWF_URL + "/cc.swf", // "http://localhost/cc.swf"
			};
			break;
		}
		
		case "/cc_browser": {
			title = "CC Browser";
			filename = "char";
			attrs = {
				data: SWF_URL + "/cc_browser.swf", // data: 'cc_browser.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: '100%', 
				height: '600', 
				style:'display:block;margin-left:auto;margin-right:auto;',
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: STORE_URL + "/<store>",
					clientThemePath: CLIENT_URL + "/<client_theme>",
					original_asset_id: query["id"] || null,
					themeId: "family",
					ut: 60,
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					retut: 1,
					goteam_draft_only: 1,
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
					lid: 13,
				},
				allowScriptAccess: "always",
				movie: SWF_URL + "/cc_browser.swf", // 'http://localhost/cc_browser.swf'
			};
			break;
		}

		case "/go_full": {
			title = "Video Editor";
			filename = "studio";
			attrs = {
				data: SWF_URL + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			};
			params = {
				flashvars: {
					appCode: "go",
					collab: 0,
					ctc: "go",
					goteam_draft_only: 1,
					isLogin: "Y",
					isWide: 1,
					lid: 0,
					nextUrl: "/",
					page: "",
					retut: 1,
					siteId: "go",
					tray: "custom",
					tlang: "en_US",
					ut: 60,
					apiserver: "http://localhost:4343/",
					storePath: STORE_URL + "/<store>",
					clientThemePath: CLIENT_URL + "/<client_theme>",
				},
				allowScriptAccess: "always",
			};
			break;
		}

		case '/player': {
			title = 'Video Player';
			filename = "player";
			attrs = {
				data: SWF_URL + '/player.swf',
				type: 'application/x-shockwave-flash', width: '100%', height: '100%',
			};
			params = {
				flashvars: {
					'apiserver': '/', 'storePath': STORE_URL + '/<store>', 'ut': 60,
					'autostart': 1, 'isWide': 1, 'clientThemePath': CLIENT_URL + '/<client_theme>',
				},
				allowScriptAccess: 'always',
				allowFullScreen: 'true',
			};
			break;
		}

		default:
			return;
	}
	res.setHeader('Content-Type', 'text/html; charset=UTF-8');
	Object.assign(params.flashvars, query);
	eta.renderFile(`${__dirname}/../views/${filename}`, { object: toObjectString(attrs, params), title: title }, (e, d) => res.end(d))
	return true;
}
