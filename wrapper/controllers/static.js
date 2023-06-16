const fs = require("fs");
const httpz = require("@octanuary/httpz");
const path = require("path");
const group = new httpz.Group();

const aniPath = path.join(__dirname, "../../server/animation");
const getBuildPath = (d, s) => path.join(aniPath, d, s);
const dateStringToDate = (s) => {
	const date = s.split("_");
	return new Date(date.join("-"));
};

/**
 * finds the lowest nearest date to the requested one
 * @param {string} requestedDate date in "yyyy_mm_dd" format
 * @returns {string} date in "yyyy_mm_dd" format
 */
function findNearestDate(requestedDate) {
	requestedDate = dateStringToDate(requestedDate);
	// sorry goanimate modders from the 3000s
	const buildDates = fs.readdirSync(aniPath).filter((d) => d.startsWith("2"));
	buildDates.forEach((v, i) => buildDates[i] = dateStringToDate(v));

	// sort the dates based on distance from the requested date
	const lowest = {
		date: null,
		distance: null
	};
	for (const buildDate of buildDates) {
		const distance = requestedDate - buildDate;
		if (
			distance > 0 && (
				lowest.distance > distance || 
				lowest.distance == null
			)
		) {
			lowest.date = buildDate;
			lowest.distance = distance;
		}
	}

	// there are no lower build dates
	if (lowest.date == null) {
		return "";
	}
	return lowest.date.toISOString().substring(0, 10).split("-").join("_");
}

/**
 * finds the last occuring swf date
 * @param {string} a startDate in "yyyy_mm_dd" format
 * @param {string} b swf
 * @returns {string}
 */
function findSWFDate(a, b) {
	return new Promise((res, rej) => {
		function iKnowAGuyWhoKnowsAGuy(startDate, swf) {
			let nearestDate = findNearestDate(startDate);
			if (nearestDate.length == 0) return rej();
			let filepath = getBuildPath(nearestDate, swf);
			
			if (!fs.existsSync(filepath)) {
				process.nextTick(() => iKnowAGuyWhoKnowsAGuy(nearestDate, swf));
			} else {
				return res(nearestDate);
			}
		}
		iKnowAGuyWhoKnowsAGuy(a, b);
	});
}

group.route(
	"GET",
	/\/static\/animation\/(\d{4}_\d{2}_\d{2}|modded|\_\_libraries)\/(\w+).(swf|swz)/,
	(req, res, next) => {
		const date = req.matches[1];
		const swf = req.matches[2] + "." + req.matches[3];
		switch (swf) {
			case "actionshop.swf":
			case "cc.swf":
			case "cc_browser.swf":
			case "go_full.swf":
			case "importer.swf":
			case "inspiration.swf":
			case "player.swf":
			case "rssplayer.swf":
				break;
			default: {
				if (date !== "__libraries") {
					return next();
				}
			}
		}
		let filepath = getBuildPath(date, swf);

		if (fs.existsSync(filepath)) {
			const readStream = fs.createReadStream(filepath);
			readStream.pipe(res);
		} else {
			if (date !== "modded" || date !== "__libraries") {
				findSWFDate(date, swf)
					.then((lastDate) => {
						filepath = getBuildPath(lastDate, swf);
						const readStream = fs.createReadStream(filepath);
						readStream.pipe(res);
					})
					.catch((err) => {
						console.log("Error getting animation SWF:", err);
						next();
					});
			} else {
				next();
			}
		}
	}
);

module.exports = group;
