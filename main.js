/*
Wrapper: Offline
License: MIT
*/
// assign config and env.json stuff to process.env
const env = Object.assign(process.env, require("./env"), require("./config"));
const fs = require("fs");
const path = require("path");
const dirs = [
	path.join(__dirname, env.ASSET_FOLDER),
	path.join(__dirname, env.CACHÉ_FOLDER),
	path.join(__dirname, env.LOG_FOLDER),
	path.join(__dirname, env.SAVED_FOLDER)
];

/*
initialization
*/
// create directories if they're missing
let restart = false;
for (const dir of dirs) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
		restart = true;
	}
}
if (restart) {
	console.log("Missing directories created. Exiting...")
	process.exit(0);
}
// start the server
const server = require("./wrapper/server");
server();

/*
log files
*/
const saveLogs = (new (require("./data/database"))(true)).select().SAVE_LOG_FILES;
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
