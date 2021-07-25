const sessions = require('../data/sessions');
const fUtil = require('../fileUtil');
const stuff = require('./info');

function toAttrString(table) {
	return typeof (table) == 'object' ? Object.keys(table).filter(key => table[key] !== null).map(key =>
		`${encodeURIComponent(key)}=${encodeURIComponent(table[key])}`).join('&') : table.replace(/"/g, "\\\"");
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

module.exports = function (req, res, url) {
	if (req.method != 'GET') return;
	const query = url.query;

	var attrs, params, title;
	switch (url.pathname) {
		case '/cc': {
			title = 'Character Creator';
			attrs = {
				data: process.env.SWF_URL + '/cc.swf', // data: 'cc.swf',
				type: 'application/x-shockwave-flash', 
				id: 'char_creator', 
				width: '960', 
				height: '600', 
				style:'display:block;margin-left:auto;margin-right:auto;',
			};
			params = {
				flashvars: {
					'apiserver': '/', 'storePath': process.env.STORE_URL + '/<store>',
					'clientThemePath': process.env.CLIENT_URL + '/<client_theme>', 'original_asset_id': query['id'] || null,
					'themeId': 'family', 'ut': 60, 'bs': 'adam', 'appCode': 'go', 'page': '', 'siteId': 'go',
					'm_mode': 'school', 'isLogin': 'Y', 'isEmbed': 1, 'ctc': 'go', 'tlang': 'en_US',
				},
				allowScriptAccess: 'always',
				movie: process.env.SWF_URL + '/cc.swf', // 'http://localhost/cc.swf'
			};
			break;
		}
		
		case "/cc_browser": {
			title = "CC Browser";
			attrs = {
				data: process.env.SWF_URL + "/cc_browser.swf", // data: 'cc_browser.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: '100%', 
				height: '600', 
				style:'display:block;margin-left:auto;margin-right:auto;',
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
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
				movie: process.env.SWF_URL + "/cc_browser.swf", // 'http://localhost/cc_browser.swf'
			};
			break;
		}

		case '/go_full': {
			let presave = query.movieId && query.movieId.startsWith('m') ? query.movieId :
				`m-${fUtil[query.noAutosave ? 'getNextFileId' : 'fillNextFileId']('movie-', '.xml')}`;
			title = 'Video Editor';
			attrs = {
				data: process.env.SWF_URL + '/go_full.swf',
				type: 'application/x-shockwave-flash', width: '100%', height: '100%',
			};
			params = {
				flashvars: {
					'apiserver': '/', 'storePath': process.env.STORE_URL + '/<store>', 'isEmbed': 1, 'ctc': 'go',
					'ut': 60, 'bs': 'default', 'appCode': 'go', 'page': '', 'siteId': 'go', 'lid': 13, 'isLogin': 'Y', 'retut': 1,
					'clientThemePath': process.env.CLIENT_URL + '/<client_theme>', 'themeId': 'business', 'tlang': 'en_US',
					'presaveId': presave, 'goteam_draft_only': 1, 'isWide': 1, 'nextUrl': '/pages/html/list.html',
				},
				allowScriptAccess: 'always',
			};
			sessions.set({ movieId: presave }, req);
			break;
		}

		case '/player': {
			title = 'Video Player';
			attrs = {
				data: process.env.SWF_URL + '/player.swf',
				type: 'application/x-shockwave-flash', width: '100%', height: '100%',
			};
			params = {
				flashvars: {
					'apiserver': '/', 'storePath': process.env.STORE_URL + '/<store>', 'ut': 60,
					'autostart': 1, 'isWide': 1, 'clientThemePath': process.env.CLIENT_URL + '/<client_theme>',
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
	res.end(`
	<head>
		<script>
			document.title='${title}',flashvars=${JSON.stringify(params.flashvars)}
		</script>
		<script>
			if(window.location.pathname == '/player') {
				function hideHeader() {
					document.getElementById("header").style.display = "none";
				}
			}
		</script>
		<link rel="stylesheet" type="text/css" href="/pages/css/modern-normalize.css">
		<link rel="stylesheet" type="text/css" href="/pages/css/global.css">
		<style>
			body {
				background: #eee;
			}
		</style>
	</head>
	
	<header id="header">
		<a href="/">
			<h1 style="margin:0"><img id="logo" src="/pages/img/list_logo.svg" alt="Wrapper: Offline"/></h1>
		</a>
		<nav id="headbuttons">
			<div class="dropdown_contain button_small">
				<div class="dropdown_button upload_button">UPLOAD</div>
				<nav class="dropdown_menu">
					<a onclick="document.getElementById('file').click()">Movie</a>
					<a onclick="document.getElementById('file2').click()">Character</a>
				</nav>
			</div>	
			<div class="dropdown_contain button_small">
				<div class="dropdown_button">CREATE A CHARACTER</div>
				<nav class="dropdown_menu">
					<h2>Comedy World</h2>
					<a href="/cc?themeId=family&bs=adam">Guy (Adam)</a>
					<a href="/cc?themeId=family&bs=eve">Girl (Eve)</a>
					<a href="/cc?themeId=family&bs=bob">Fat (Bob)</a>
					<a href="/cc?themeId=family&bs=rocky">Buff (Rocky)</a>
					<hr />
					<h2>Anime</h2>
					<a href="/cc?themeId=anime&bs=guy">Guy</a>
					<a href="/cc?themeId=anime&bs=girl">Girl</a>
					<a href="/cc?themeId=ninjaanime&bs=guy">Guy (Ninja)</a>
					<a href="/cc?themeId=ninjaanime&bs=girl">Girl (Ninja)</a>
					<hr />
					<h2>Peepz</h2>
					<a href="/cc?themeId=cc2&bs=default">Lil Peepz</a>
					<a href="/cc?themeId=chibi&bs=default">Chibi Peepz</a>
					<a href="/cc?themeId=ninja&bs=default">Chibi Ninjas</a>
				</nav>
			</div>
			<div class="dropdown_contain button_small">
				<div class="dropdown_button">BROWSE CHARACTERS</div>
				<nav class="dropdown_menu">
					<h2>Comedy World</h2>
					<a href="/cc_browser?themeId=family">Comedy World</a>
					<hr />
					<h2>Anime</h2>
					<a href="/cc_browser?themeId=anime">Anime</a>
					<a href="/cc_browser?themeId=ninjaanime">Ninja Anime</a>
					<hr />
					<h2>Peepz</h2>
					<a href="/cc_browser?themeId=cc2">Lil' Peepz</a>
					<a href="/cc_browser?themeId=chibi">Chibi Peepz</a>
					<a href="/cc_browser?themeId=ninja">Chibi Ninjas</a>
				</nav>
			</div>
			<a href="/go_full" class="button_big">MAKE A VIDEO</a>
		</nav>
	</header>
	
	<body style="margin:0px" onload="hideHeader()">${toObjectString(attrs, params)
		}</body>${stuff.pages[url.pathname] || ''}`);
	return true;
}
