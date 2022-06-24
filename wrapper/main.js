/***
 * Wrapper: Offline
 */
// modules
import fs from "fs";
import { join } from "path";
import RPC from "discord-rpc";
// assign config and env.json stuff to process.env
const env = JSON.parse(fs.readFileSync("./env.json"));
const config = JSON.parse(fs.readFileSync("./config.json"));
Object.assign(process.env, env, config);
// vars
const assets = join(env.ASSET_FOLDER);
const cache = join(env.CACHÉ_FOLDER);
const saved = join(env.SAVED_FOLDER);
// stuff
import server from "./server.js";

/**
 * initialization
 */
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);
// start the server
server();

/**
 * rich presence
 */
if (process.env.DISCORD_RPC && process.env.DISCORD_RPC == "y") {
	// get version number
	const version = process.env.WRAPPER_VER;
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
