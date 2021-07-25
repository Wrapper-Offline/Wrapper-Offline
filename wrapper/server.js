const env = Object.assign(process.env,
	require('./env'),
	require('./config'));

const http = require('http');
const asu = require('./asset/upload');
const asl = require('./asset/load');
const asL = require('./asset/list');
const ast = require('./asset/thmb');
const chr = require('./character/redirect');
const pmc = require('./character/premade');
const chl = require('./character/load');
const chs = require('./character/save');
const chu = require('./character/upload');
const stl = require('./static/load');
const stp = require('./static/page');
const mvl = require('./movie/load');
const mvL = require('./movie/list');
const mvm = require('./movie/meta');
const mvs = require('./movie/save');
const mvt = require('./movie/thmb');
const mvu = require('./movie/upload');
const thl = require('./theme/load');
const thL = require('./theme/list');
const tsv = require('./tts/voices');
const tsl = require('./tts/load');
const evt = require('./events');
const url = require('url');

const functions = [
	asu,
	asl,
	asL,
	ast,
	chr,
	pmc,
	chl,
	chs,
	chu,
	stl,
	stp,
	mvl,
	mvL,
	mvm,
	mvs,
	mvt,
	mvu,
	thl,
	thL,
	tsv,
	tsl,
	evt,
];

// Creates an HTTP server
module.exports = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	//if (!parsedUrl.path.endsWith('/')) parsedUrl.path += '/';
	const found = functions.find(f => f(req, res, parsedUrl));
	if (!found) { res.statusCode = 404; res.end(); }
}).listen(env.PORT || env.SERVER_PORT, console.log);

// 2epik4u is weird
// update: still weird
