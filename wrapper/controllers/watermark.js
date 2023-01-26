const httpz = require("@octanuary/httpz");
const database = require("../../data/database"), DB = new database();
const DB2 = new database(true);
// why is this even in the env
const header = process.env.XML_HEADER;
const group = new httpz.Group();

/*
default watermark: 0vTLbQy9hG7k
no watermark: 0dhteqDBt5nY
*/


/*
assign
*/
group.route("POST", /\/goapi\/assignwatermark\/movie\/([\S]+)\/([\S]+)/, (req, res) => {
	const mId = req.matches[1];
	let wId = req.matches[2];
	// reset the watermark if it's the no watermark id
	if (wId == "0dhteqDBt5nY") wId = undefined;

	if (DB.update("movies", mId, { watermark: wId })) {
		res.end("0");
	} else {
		res.statusCode = 404;
		res.end("1Movie doesn't exist.");
	}
});

/*
list
*/
group.route("POST", "/goapi/getUserWatermarks/", (req, res) => {
	const mId = req.body.movieId;

	let wId = DB.get("movies", mId || "loser")?.data?.watermark || "what";
	const list = DB.select("assets", { type: "watermark" });
	res.setHeader("Content-Type", "application/xml");
	res.end(`${header}<watermarks>${
		list.map((w) => `<watermark id="${w.id}" thumbnail="/assets/${w.id}"/>`).join("")
	}${wId != "what" ? `<preview>${wId}</preview>` : ""}</watermarks>`);
});

/*
load
*/
group.route("POST", "/goapi/getMovieInfo/", (req, res) => {
	const mId = req.body.movieId;
	const movie = DB.get("movies", mId);
	if (!movie) {
		res.statusCode = 400;
		res.end("1Movie not found.");
		return;
	}

	const wId = movie.data.watermark;
	res.setHeader("Content-Type", "application/xml");
	res.end(`${header}<watermarks>${
		typeof wId == "undefined" ?
			// no watermark
			`<watermark style="octanuary"/>` : wId == "0vTLbQy9hG7k" ?
				// default watermark
				(() => {
					const defaultW = DB2.select().DEFAULT_WATERMARK;
					return defaultW == "default" ?
						// return nothing for the GoAnimate watermark
						"" :
						`<watermark style="${defaultW}"/>`
				})() :
				// custom watermark
				`<watermark>/assets/${wId}</watermark>`
	}</watermarks>`);
});

module.exports = group;
