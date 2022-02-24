/***
 * Wrapper: Offline
 */
// start server
require("./server");

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
