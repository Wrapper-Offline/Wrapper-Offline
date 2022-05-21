module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/getCCPreMadeCharacters") return;
	res.end();
	return true;
}