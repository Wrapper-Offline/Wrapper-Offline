/***
 * request body parser
 */

/**
 * @param {boolean} parse
 */
module.exports = function (req, res) {
	return new Promise((res, rej) => {
		var data = "";
		var pData;

		req.on("data", v => {
			data += v
			if (data.length > 1e10) {
				data = "";
				res.writeHead(413);
				res.end();
				req.connection.destroy();
				rej();
			}
		});

		req.on("end", () => {
			try {
				pData = JSON.parse(data.toString());
			} catch (e) {
				const params = new URLSearchParams(data.toString());
				pData = Object.fromEntries(params);
			}
			res(pData)
		});
	});
}