/**
 * rich presence
 */
console.log(process.env.DISCORD_RPC)
if (!!process.env.DISCORD_RPC) {
	// modules
	const RPC = require("discord-rpc");
	const rpc = new RPC.Client({
		transport: "ipc"
	});
	// vars
	const {
		WRAPPER_VER: version,
		DISCORD_CLIENT: clientId,
	} = process.env;
	const startTime = new Date();


	// set rpc activity when started
	rpc
		.on("ready", () => setRPC("Idling"))
		// connect rpc to app
		.login({ clientId })
		.catch((e) => console.log("RPC connection failed."));

	module.exports = setRPC;
	function setRPC(state) {
		rpc.setActivity({
			state,
			details: `Version ${version}`,
			startTimestamp: startTime,
			largeImageKey: "icon",
			largeImageText: "Wrapper: Offline",
			smallImageKey: "Wrapper: Offline",
			smallImagetext: "Wrapper: Offline",
		});
	}
	return;
}
// set a blank function so we don't have to check if it's enabled
module.exports = function () {};
