/*
Wrapper: Offline
License: MIT
*/

// assign config and env.json stuff to process.env
const env = Object.assign(process.env, require("../env.json"), require("../config.json"));

const { app, BrowserWindow, Menu, shell } = require("electron");
const fs = require("fs");
const path = require("path");

/*
make sure required dirs exist
*/
const requiredPaths = [
	path.join(__dirname, "../", env.ASSET_FOLDER),
	path.join(__dirname, "../", env.CACHÉ_FOLDER),
	path.join(__dirname, "../", env.LOG_FOLDER),
	path.join(__dirname, "../", env.SAVED_FOLDER),
	path.join(__dirname, "../", env.EXPORT_FOLDER),
];
for (const p of requiredPaths) {
	if (!fs.existsSync(p)) {
		fs.mkdirSync(p);
	}
}

const settings = require("./data/settings.js").instance;
const server = require("./server/index.js");

/*
log files
*/
if (settings.saveLogFiles) {
	const filePath = path.join(env.LOG_FOLDER, new Date().valueOf() + ".txt");
	const writeStream = fs.createWriteStream(filePath);
	console.log = console.error = console.warn = function (c) {
		writeStream.write(c + "\n");
		process.stdout.write(c + "\n");
	};
	process.on("exit", () => {
		console.log("Exiting...");
		writeStream.close();
	});
}

// and now we can start the server before electron starts
server();

/*
load flash player
*/
let pluginName;
switch (process.platform) {
	case "win32": {
		pluginName = "./extensions/pepflashplayer.dll";
		break;
	}
	case "darwin": {
		pluginName = "./extensions/PepperFlashPlayer.plugin";
		break;
	}
	case "linux": {
		pluginName = "./extensions/libpepflashplayer.so";
		// i don't know what this does but it makes flash work
		app.commandLine.appendSwitch("no-sandbox");
		break;
	}
	default: {
		throw new Error("You are running Wrapper: Offline on an unsupported platform.");
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
		icon: path.join(__dirname, "../server/favicon.ico"),
		webPreferences: {
			plugins: true,
			contextIsolation: true
		}
	});

	mainWindow.setAutoHideMenuBar(settings.hideNavbar);
	Menu.setApplicationMenu(Menu.buildFromTemplate([
		{
			label: "Home",
			click: () => {
				mainWindow.loadURL("http://localhost:4343")
			}
		},
		{
			label: "View",
			submenu: [
				{ type: "separator" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ role: "resetZoom" },
				{ type: "separator" },
				{ role: "toggleDevTools" },
				{ type: "separator" },
				{ role: "minimize" },
				...(process.platform == "darwin" ? [
					{ role: "front" },
					{ type: "separator" },
					{ role: "window" }
				] : [
					{ role: "close" }
				]),
			]
		},
		{
			role: "help",
			submenu: [
				{
					label: "Discord Server",
					click: async () => {
						await shell.openExternal("https://discord.gg/Kf7BzSw");
					}
				},
				{
					label: "GitHub",
					click: async () => {
						await shell.openExternal("https://github.com/Wrapper-Offline/Wrapper-Offline");
					}
				}
			]
		}
	]));
	// load the video list
	mainWindow.loadURL("http://localhost:" + env.SERVER_PORT);
	mainWindow.on("closed", () => process.exit(0));
};

app.whenReady().then(() => {
	// wait for the server
	setTimeout(createWindow, 2000);
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (mainWindow === null) createWindow();
});
