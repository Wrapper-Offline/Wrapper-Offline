/**
 * @typedef {{movieId:string}} sessionType
 * @type {{[ip:string]:sessionType}}
 */
var caché = {};
module.exports = {
	getKey(req) {
		return req.headers['x-forwarded-for'];
	},
	/**
	 * 
	 * @param {sessionType} data 
	 */
	set(data, req) {
		const ip = this.getKey(req);
		caché[ip] = caché[ip] || {};
		Object.assign(caché[ip], data);
		/*
		console.log('Session Adding.');
		console.log(ip);
		console.log(data);
		*/
	},
	get(req) {
		const ip = this.getKey(req);
		return caché[ip];
	},
	remove(req) {
		const ip = this.getKey(req);
		/*
		console.log('Session Removing.');
		console.log(ip);
		console.log(caché[ip]);
		*/
		delete caché[ip];
	},
}