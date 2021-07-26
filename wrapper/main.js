// Core part of Wrapper: Offline
const RPC = require("discord-rpc");
require("./server");


// Loads env.json for Wrapper version and build number
const env = Object.assign(process.env,
	require('./env'));
// env.json variables
let version = env.WRAPPER_VER;
let build = env.WRAPPER_BLD;


// Discord rich presence
const rpc = new RPC.Client({
	transport: "ipc"
});
rpc.on("ready", () => {
	// Sets RPC activity
	rpc.setActivity({
		// state: "Video List",
		// disabled until automatic rpc status is done
		details: "Version " + version +", build " + build,
		startTimestamp: new Date(),
		largeImageKey: "icon",
		largeImageText: "Wrapper: Offline",
		smallImageKey: "Wrapper: Offline",
		smallImagetext: "Wrapper: Offline",
	});
	// Logs "Rich presence is on!" in the console
	console.log("Rich presence is on!")
});
// Connects RPC to app
rpc.login({
	clientId: "866340172874383370"
});

