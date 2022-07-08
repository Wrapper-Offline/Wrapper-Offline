/**
 * tts routes
 */
// modules
const fs = require("fs");
const httpz = require("httpz");
const tempfile = require("tempfile");
// vars
const info = require("../data/voices");
// stuff
const Asset = require("../models/asset");
const fileUtil = require("../../utils/realFileUtil");
const processVoice = require("../models/tts");

// create the group
const group = new httpz.Group();

/*
 * generate the list
 */
const voices = info.voices, langs = {};
Object.keys(voices).forEach((i) => {
	const v = voices[i], l = v.language;
	langs[l] = langs[l] || [];
	langs[l].push(`<voice id="${i}" desc="${v.desc}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
});
const xml = `${process.env.XML_HEADER}<voices>${
	Object.keys(langs).sort().map(i => {
		const v = langs[i], l = info.languages[i];
		return `<language id="${i}" desc="${l}">${v.join('')}</language>`;
	}).join('')}</voices>`;

group
	// list
	.route("POST", "/goapi/getTextToSpeechVoices/", (req, res) => {
		res.setHeader("Content-Type", "text/html; charset=UTF-8");
		res.end(xml);
	})
	// load
	.route("POST", "/goapi/convertTextToSoundAsset/", async (req, res) => {
		const { voice, text } = req.body;
		res.assert(voice, text, 400, "");

		try {
			const filepath = tempfile(".mp3");
			const writeStream = fs.createWriteStream(filepath);
			const readStream = await processVoice(voice, text);
			readStream.pipe(writeStream);

			writeStream.on("close", async () => {
				const duration = await fileUtil.mp3Duration(filepath);
				const meta = {
					duration,
					type: "sound",
					subtype: "tts",
					title: `[${voices[voice].desc}] ${text}`
				}
				const id = await Asset.save(filepath, "mp3", meta);
				res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
			});
		} catch (e) {
			console.error("Error generating TTS:", e);
			res.end(`1<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
		};
	});

module.exports = group;
