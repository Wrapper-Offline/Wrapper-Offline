const fs = require("fs");
const httpz = require("@octanuary/httpz");
const tempfile = require("tempfile");
const Asset = require("../models/asset");
const { mp3Duration } = require("../../utils/fileUtil");
const processVoice = require("../models/tts");
const https = require("https");
let info;
const database = require("../../data/database"), db = new database(true).select();
if (db.fakevoices) info = require("../data/fakevoices");
else info = require("../data/voices")
const info2 = {
	voices: {}
};
https.get('https://api.fakeyou.com/tts/list', (r) => { // gets the tts voices for the fakevoices.json file
	let buffers = [];
	r.on("data", (b) => buffers.push(b)).on("end", () => {
		const json = JSON.parse(Buffer.concat(buffers));
		const malformedFakeVoices = { // fake voices that are nictorious for causing an actionscript error
			"9": true,
			"50": true,
			"1st": true,
			"2m": true,
			"2pac": true,
			"\"blitzcrank\"": true,
			"\"daniel\"": true,
			"\"weird": true,
			ashley: true,
			baldina: true,
			barrytube: true,
			casually: true,
			christine: true,
			ddrmax: true,
			felix: true,
			fizzarolli: true,
			ghost: true,
			keith: true,
			moxxie: true,
			racist: true,
			scooby: true,
			skip: true,
			spongebob: true,
			stolas: true,
			tuv: true,
			"larry(": true,
			"larry(zootopia\\rich": true,
		};
		if (json.success) {
			for (const voice of json.models) {
				if (!malformedFakeVoices[voice.title.split(" ")[0].split("-")[0].split("+")[0].toLowerCase()]) {
					info2.voices[voice.title.split(" ")[0].split("-")[0].split("+")[0].toLowerCase().replace(`\"`, '').replace(".", '1')] = {
						country: "US",
						language: voice.ietf_primary_language_subtag,
						gender: "M",
						source: "fakeyou",
						arg: voice.model_token.substr(voice.model_token.lastIndexOf(":") + 1),
						desc: voice.title.split(" ")[0].split("'s")[0],
						userToken: voice.creator_user_token.substr(voice.model_token.lastIndexOf(":") + 1)
					}
				}
			}
			info2.languages = {
				hi: "Hindi",
				ku: "Kurdish",
				az: "Azeri",
				ur: "Urdu",
				th: "Thai",
				el: "Greek",
				fi: "Suomi",
				ar: "Arabic",
				de: "German",
				fr: "French",
				da: "Danish",
				en: "English",
				es: "Spanish",
				ca: "Catalan",
				ru: "Russian",
				it: "Italian",
				tr: "Turkish",
				zh: "Chinese",
				ja: "Japanese",
				ro: "Romanian",
				no: "Norwegian",
				va: "Valencian",
				pt: "Portuguese",
				eo: "Esperanto",
				gl: "Galician",
				sv: "Swedish",
				ko: "Korean",
				pl: "Polish",
				nl: "Dutch",
				cy: "Welsh",
				id: "Indonesian",
				fo: "Faroese",
				is: "Icelandic",
				gd: "Scottish Gaelic",
				cs: "Czech"
			}
			fs.writeFileSync(`${__dirname}/../data/fakevoices.json`, JSON.stringify(info2, null, "\t"));
		}
	});
})
const group = new httpz.Group();

/*
generate the list
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
		return `<language id="${i}" desc="${l}">${v.join("")}</language>`;
	}).join("")}</voices>`;

/*
list
*/
group.route("POST", "/goapi/getTextToSpeechVoices/", (req, res) => {
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	res.end(xml);
});

/*
load
*/
group.route("POST", "/goapi/convertTextToSoundAsset/", async (req, res) => {
	const { voice, text } = req.body;
	res.assert(voice, text, 400, "");

	const filepath = tempfile(".mp3");
	const writeStream = fs.createWriteStream(filepath);
	processVoice(voice, text).then((data) => {
		if (typeof data.on == "function") {
			data.pipe(writeStream);
		} else {
			writeStream.end(data);
		}

		writeStream.on("close", async () => {
			const duration = await mp3Duration(filepath);
			const meta = {
				duration,
				type: "sound",
				subtype: "tts",
				title: `[${voices[voice].desc}] ${text}`
			};
			const id = await Asset.save(filepath, "mp3", meta);
			res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
		});
	}).catch((err) => {
		console.error("Error generating TTS:", err);
		res.end(`1<error><code>ERR_ASSET_404</code><message>${err}</message><text></text></error>`);
	});
});

module.exports = group;
