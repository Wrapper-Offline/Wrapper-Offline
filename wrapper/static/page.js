/**
 * route
 * flash pages
 */
// modules
const eta = require("eta");
const fs = require("fs");
const path = require("path");
// stuff
function toAttrString(table) {
	return typeof (table) == "object" ? new URLSearchParams(table).toString() : table.replace(/"/g, "\\\"");
}
function toParamString(table) {
	return Object.keys(table).map(key =>
		`<param name="${key}" value="${toAttrString(table[key])}">`
	).join(" ");
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs).map(key =>
		`${key}="${attrs[key].replace(/"/g, "\\\"")}"`
	).join(" ")}>${toParamString(params)}</object>`;
}

/**
 * Generates a Flash page.
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {url.UrlWithParsedQuery} url 
 * @returns {boolean | void}
 */
module.exports = async function (req, res, url) {
	if (req.method != "GET") return;
	const query = url.query;

	// parse urls for the lvm
	const SWF_URL = process.env.SWF_URL.replace("127.0.0.1", "localhost");
	const STORE_URL = process.env.STORE_URL.replace("127.0.0.1", "localhost");
	const CLIENT_URL = process.env.CLIENT_URL.replace("127.0.0.1", "localhost");

	let extra, filename;
	switch (url.pathname) {
		case "/cc": {
			filename = "app/char";
			extra = {
				title: "Character Creator",
				attrs: {
					data: SWF_URL + "/cc.swf",
					type: "application/x-shockwave-flash", 
					id: "char_creator", 
					width: "960", 
					height: "600", 
					class: "char_object"
				},
				params: {
					flashvars: {
						appCode: "go",
						ctc: "go",
						isEmbed: 1,
						isLogin: "Y",
						m_mode: "school",
						page: "",
						siteId: "go",
						tlang: "en_US",
						ut: 60,
						// options
						bs: "adam",
						original_asset_id: query["id"] || "",
						themeId: "family",
						// paths
						apiserver: "/",
						storePath: STORE_URL + "/<store>",
						clientThemePath: CLIENT_URL + "/<client_theme>"
					},
					allowScriptAccess: "always",
					movie: SWF_URL + "/cc.swf",
				},
				object: toObjectString
			};
			break;
		} case "/cc_browser": {
			filename = "app/char";
			extra = {
				title: "Character Browser",
				attrs: {
					data: SWF_URL + "/cc_browser.swf",
					type: "application/x-shockwave-flash",
					id: "char_creator",
					width: '100%', 
					height: '600', 
					class: "char_object"
				},
				params: {
					flashvars: {
						appCode: "go",
						ctc: "go",
						isEmbed: 1,
						isLogin: "Y",
						m_mode: "school",
						page: "",
						siteId: "go",
						tlang: "en_US",
						ut: 60,
						// options
						themeId: "family",
						// paths
						apiserver: "/",
						storePath: STORE_URL + "/<store>",
						clientThemePath: CLIENT_URL + "/<client_theme>"
					},
					allowScriptAccess: "always",
					movie: SWF_URL + "/cc_browser.swf"
				},
				object: toObjectString
			};
			break;
		} case "/go_full": {
			filename = "app/studio";
			extra = {
				title: "Video Editor",
				attrs: {
					data: SWF_URL + "/go_full.swf",
					type: "application/x-shockwave-flash", width: "100%", height: "100%",
				},
				params: {
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
				},
				object: toObjectString
			};
			break;
		} case "/player": {
			filename = "app/player";
			extra = {
				title: "Video Player",
				attrs: {
					data: SWF_URL + '/player.swf',
					type: 'application/x-shockwave-flash', width: '100%', height: '100%',
				},
				params: {
					flashvars: {
						'apiserver': '/', 'storePath': STORE_URL + '/<store>', 'ut': 60,
						'autostart': 1, 'isWide': 1, 'clientThemePath': CLIENT_URL + '/<client_theme>',
					},
					allowScriptAccess: 'always',
					allowFullScreen: 'true',
				},
				object: toObjectString
			};
			break;
		} default: {
			filename = url.pathname + ".eta";
			extra = {};
			if (!filename.startsWith("/app/") &&
			fs.existsSync(path.join(__dirname, "../views", filename)))
				break;
			return;
		};
	}
	// add the query to the flashvars
	Object.assign(extra.params?.flashvars || {}, query);

	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	try {
		const filepath = path.join(__dirname, "../views", filename);
		const file = Buffer.from(await eta.renderFile(filepath, {
			env: process.env,
			extra: extra
		}));
		res.end(file);
	} catch (e) {
		console.error("Error rendering page:", e);
		res.statusCode = 500;
		res.end();
	}
	return true;
}
