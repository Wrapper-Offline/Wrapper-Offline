const { BrowserWindow, Menu } = require("electron");
const httpz = require("httpz");

/**
 * Sets the status bar for the Video Editor.
 * @param {httpz.Request} req
 * @param {httpz.Response} res
 * @param {Function} next 
 * @returns {void}
 */
module.exports = function resRender(req, res, next) {
	// filter unwanted requests
	switch (req.parsedUrl.pathname.substring(1, 4) || "home") {
		case "sta":
		case "sto":
		case "pag":
		case "goa":
		case "api":
			return next();
	}

	if (req.parsedUrl.pathname == "/go_full") {
		Menu.setApplicationMenu(Menu.buildFromTemplate([
			{
				label: "Home",
				click: () => {
					const id = +process.env.MAIN_WINDOW_ID;
					BrowserWindow.fromId(id).loadURL("http://localhost:4343")
				}
			}
		]));
	} else {
		Menu.setApplicationMenu(Menu.buildFromTemplate([]));
	}
    next();
};
