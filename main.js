/**
 * Wrapper: Offline
 * License: MIT
 */
// assign config and env.json stuff to process.env
const env = Object.assign(process.env, require("./env"), require("./config"));
// modules
const { app, BrowserWindow, Menu } = require("electron");
const fs = require("fs");
const open = require("open");
const path = require("path");
// vars
const assets = path.join(__dirname, env.ASSET_FOLDER);
const cache = path.join(__dirname, env.CACHÉ_FOLDER);
const saved = path.join(__dirname, env.SAVED_FOLDER);
// stuff
const discord = require("./utils/discord");

/**
 * initialization
 */
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);
// start the server
const server = require("./wrapper/server");
server();

/**
 * load flash player
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
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: true,
			webSecurity: false
		}
	});
	Menu.setApplicationMenu(Menu.buildFromTemplate([]));

	//mainWindow.loadFile("./LICENSE");
	mainWindow.loadURL("http://localhost:4343");

	mainWindow.on("closed", () => mainWindow = null);

	mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
	createWindow();
});
app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	// On macOS it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow();
});
