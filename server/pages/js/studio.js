const importer = $("#importer");
const previewer = $("#previewer");
const cc = $("#cc_window");
const studio = $("#obj");
const body = $("body");

/*
studio functions
*/
const tutorialReload = (new URLSearchParams(window.location.search)).get("tutorial");
interactiveTutorial = {
	neverDisplay: function() {
		return tutorialReload ? false : true;
	}
};
function studioLoaded(arg) { console.log(arg) }
function quitStudio() { window.location.href = "/" }

/*
show and hide widgets
*/
let importerVisible = false;
function showImporter() {
	switch(importerVisible) {
		case true: {
			hideImporter();
			break;
		}
		case false:
		default: {
			importerVisible = true;
			importer.height(window.innerHeight);
			importer.show();
			if (!importer.data("importer"))
				importer.data("importer", new AssetImporter(importer));
		}
	}
	return true;
}
function hideImporter() {
	importerVisible = false;
	importer.hide();
}

function showCCWindow(themeId) {
	hideImporter();
	cc.find("iframe").attr("src", "/cc_browser?themeId="+themeId+"&external=true");
	cc.css("display", "block");
	studio.css("height", "1px");
	body.css("background-color", "#262d3f");
}
function hideCCWindow() {
	cc.css("display", "none");
	cc.find("iframe").attr("src", "");
	studio.css("height", "");
	body.css("background-color", "");
}

function initPreviewPlayer(dataXmlStr, startFrame, containsChapter, themeList) {
	movieDataXmlStr = dataXmlStr;
	filmXmlStr = dataXmlStr.split("<filmxml>")[1].split("</filmxml>")[0];
	hideImporter(); // hide importer before previewing
	// update flashvars
	const flashvars = new URLSearchParams({
		apiserver: "/",
		isEmbed: 1,
		tlang: "en_US",
		isInitFromExternal: 1,
		startFrame: startFrame,
		autostart: 1,
		isPreview: 1,
		storePath: STORE_URL + "/<store>",
		clientThemePath: CLIENT_URL + "/<client_theme>",
	}).toString();
	previewer.find("object param[name='flashvars']").attr("value", flashvars);
	previewer.css("display", "block");
	studio.css("height", "1px");
	body.css("background-color", "#262d3f");
}
function retrievePreviewPlayerData() { return movieDataXmlStr }
function hidePreviewer() {
	previewer.css("display", "none");
	previewer.find("object param[name='flashvars']").attr("value", "");
	studio.css("height", "");
	body.css("background-color", "");
}
