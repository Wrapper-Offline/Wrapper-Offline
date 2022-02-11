/***
 * Wrapper: Offline
 */
// start server
require("./server");

/**
 * rich presence
 */
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
	.catch(console.log("RPC connection failed."));

