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
// stuff
const server = require("./server");

/**
 * custom stuff
 */
/**
 * Split a string into substrings using the specified separator and return them as an array.
 * @param {number[]} separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned. 
 * @returns {string[]}
 */
String.prototype.splitIndex = function(...separator) {
	const sorted = separator.sort((a, b) => b - a);
	
	let substrings = [];
	let string = this;
	sorted.forEach(v => {
		if (v < 0) throw new Error("Negative index");
		substrings.push(string.substring(0, v));
		string = string.substring(v);
	});
	substrings.push(string);
	
	return substrings;
};
console.log("hi how was your day ok".splitIndex(3))

/**
 * initialization
 */
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);
// start server
server.apiServer();
server.staticServer();