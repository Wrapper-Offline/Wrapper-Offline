/**
 * Wrapper: Offline
 * Author: W:O Development Team
 * Project Runner: GoTest334#9880
 * License: MIT
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
// stuff
const server = require("./api/server");

/**
 * initialization
 */
const titleBase = `Wrapper: Offline v${env.WRAPPER_VER}`;
process.title = `${titleBase} [Initializing...]`;
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);

/**
 * starting wrapper
 */
// Welcome, Director Ford!
process.title = `${titleBase} [Loading...]`
console.log(
	"Wrapper: Offline\n" +
	"A project from VisualPlugin adapted by GoTest334 and the W:O team\n" +
	`Version ${env.WRAPPER_VER}\n`
);
server.apiServer();

const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});

function wrapperPatch() {

}

function wrapperIdle() {
	readline.question("What would you like to do?", option => {
		console.log("You chose: " + option)
	})
}