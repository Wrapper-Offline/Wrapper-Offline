/***
 * Wrapper: Offline
 */
// assign config and env.json stuff to process.env
const env = Object.assign(process.env, require("./env"), require("./config"));
// modules
const fs = require("fs");
const path = require("path");
// vars
const assets = path.join(__dirname, env.ASSET_FOLDER);
const cache = path.join(__dirname, env.CACHÉ_FOLDER);
const saved = path.join(__dirname, env.SAVED_FOLDER);

/**
 * initialization
 */
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);
// start server
const server = require("./server");
server();

/**
 * rich presence
 */
if (process.env.DISCORD_RPC && process.env.DISCORD_RPC == "y") {
	// get version number
	const version = process.env.WRAPPER_VER;
	const RPC = require("discord-rpc");
	const rpc = new RPC.Client({
		transport: "ipc"
	});

	// sets rpc activity when ready
	rpc.on("ready", () => {
		rpc.setActivity({
			details: `Version ${version}`,
			startTimestamp: new Date(),
			largeImageKey: "icon",
			largeImageText: "Wrapper: Offline",
			smallImageKey: "Wrapper: Offline",
			smallImagetext: "Wrapper: Offline",
		});
	});

	// connect rpc to app
	rpc
		.login({ clientId: "866340172874383370" })
		.catch((e) => console.log("RPC connection failed."));
}
