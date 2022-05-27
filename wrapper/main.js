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
 * initialization
 */
// create directories if they're missing
if (!fs.existsSync(assets)) fs.mkdirSync(assets);
if (!fs.existsSync(cache)) fs.mkdirSync(cache);
if (!fs.existsSync(saved)) fs.mkdirSync(saved);
// start server
server();
