/*
Wrapper: Offline
License: MIT
*/
// assign config and env.json stuff to process.env
const env = Object.assign(process.env, require("./env"), require("./config"));
const { app, BrowserWindow, Menu, globalShortcut } = require("electron");
const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, env.ASSET_FOLDER);
const cache = path.join(__dirname, env.CACHÉ_FOLDER);
const saved = path.join(__dirname, env.SAVED_FOLDER);

/*
initialization
*/
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);
// start discord rpc
const discord = require("./utils/discord");
// start the server
const server = require("./wrapper/server");
server();

/*
load flash player
*/
let pluginName;
switch (process.platform) {
	case "win32": {
		pluginName = "./extensions/pepflashplayer.dll";
		break;
	} case "darwin": {
		pluginName = "./extensions/PepperFlashPlayer.plugin";
		break;
	} case "linux": {
		pluginName = "./extensions/libpepflashplayer.so";
		// i don't know what this does but it makes flash work
		app.commandLine.appendSwitch("no-sandbox");
		break;
	}
}
app.commandLine.appendSwitch("ppapi-flash-path", path.join(__dirname, pluginName));
app.commandLine.appendSwitch("ppapi-flash-version", "32.0.0.371");

let mainWindow;
const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 700,
		title: "Wrapper: Offline",
		icon: path.join(__dirname, "./server/favicon.ico"),
		webPreferences: {
			plugins: true,
			contextIsolation: true
		}
	});
	// use it in external scripts
	process.env.MAIN_WINDOW_ID = mainWindow.id;

	// initialize stuff
	// clear the menu bar
	Menu.setApplicationMenu(Menu.buildFromTemplate([]));
	// load the video list
	mainWindow.loadURL("http://localhost:" + env.SERVER_PORT);
	mainWindow.on("closed", () => mainWindow = null);

	// debug stuff
	if (env.NODE_ENV == "development") {
		mainWindow.webContents.openDevTools();
	}
};

app.whenReady().then(() => {
	// wait for the server
	setTimeout(() => {
		createWindow();
		// set shortcuts
		globalShortcut.register("CommandOrControl+Shift+I", () => {
			const window = BrowserWindow.fromId(+process.env.MAIN_WINDOW_ID);
			if (window.webContents.isDevToolsOpened()) {
				window.webContents.closeDevTools();
			} else {
				window.webContents.openDevTools();
			}
		});
		globalShortcut.register("CommandOrControl+-", () => {
			const window = BrowserWindow.fromId(+process.env.MAIN_WINDOW_ID);
			const zoom = window.webContents.getZoomFactor();
			if (zoom - 0.2 > 0.1) {
				window.webContents.setZoomFactor(zoom - 0.2);
			}
		});
		globalShortcut.register("CommandOrControl+=", () => {
			const window = BrowserWindow.fromId(+process.env.MAIN_WINDOW_ID);
			const zoom = window.webContents.getZoomFactor();
			window.webContents.setZoomFactor(zoom + 0.2);
		});
	}, 2000);
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (mainWindow === null) createWindow();
});
