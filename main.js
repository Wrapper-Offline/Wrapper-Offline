/*
Wrapper: Offline
License: MIT
*/
// assign config and env.json stuff to process.env
const env = Object.assign(process.env, require("./env"), require("./config"));
const saveLogs = (new (require("./data/database"))(true)).select().SAVE_LOG_FILES;
const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, env.ASSET_FOLDER);
const cache = path.join(__dirname, env.CACHÉ_FOLDER);
const logs = path.join(__dirname, env.LOG_FOLDER);
const saved = path.join(__dirname, env.SAVED_FOLDER);

/*
initialization
*/
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(logs)) fs.mkdirSync(logs);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);
// start discord rpc
const discord = require("./utils/discord");
// start the server
const server = require("./wrapper/server");
server();

/*
log files
*/
if (saveLogs) {
	const filePath = path.join(logs, new Date().valueOf() + ".txt");
	const writeStream = fs.createWriteStream(filePath);
	console.log = console.error = function (c) {
		writeStream.write(c + "\n");
		process.stdout.write(c + "\n");
	};
	process.on("exit", () => {
		console.log("Exiting...");
		writeStream.close();
	});
}
