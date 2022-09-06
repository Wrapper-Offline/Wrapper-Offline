/**
 * tts api
 */
// modules
const brotli = require("brotli");
const https = require("https");
const http = require("http");
const md5 = require("js-md5");
// vars
const voices = require("../data/voices.json").voices;

/**
 * uses tts demos to generate tts
 * @param {string} voiceName voice name
 * @param {string} text text
 * @returns {IncomingMessage}
 */
module.exports = function processVoice(voiceName, rawText) {
	return new Promise(async (res, rej) => {
		const voice = voices[voiceName];
		if (!voice) {
			rej("That voice doesn't seem to exist.");
		}

		let flags = {};
		const pieces = rawText.split("#%");
		let text = pieces.pop();
		for (const rawFlag of pieces) {
			const index = rawFlag.indexOf("=");
			if (index == -1) continue;
			const name = rawFlag.substring(0, index);
			const value = rawFlag.substring(index + 1);
			flags[name] = value;
		}

		try {
			switch (voice.source) {
				case "polly": {
					// make sure it's under the char limit
					text = text.substring(0, 181);
					const body = new URLSearchParams({
						msg: text,
						lang: voice.arg,
						source: "ttsmp3"
					}).toString();

					const req = https.request(
						{
							hostname: "ttsmp3.com",
							path: "/makemp3_new.php",
							method: "POST",
							headers: { 
								"Content-Length": body.length,
								"Content-type": "application/x-www-form-urlencoded"
							}
						},
						(r) => {
							let body = "";
							r.on("data", (b) => body += b);
							r.on("end", () => {
								const json = JSON.parse(body);
								if (json.Error == 1) rej(json.Text);

								https
									.get(json.URL, res)
									.on("error", rej);
							});
							r.on("error", rej);
						}
					).on("error", rej);
					req.end(body);
					break;
				}
				case "nuance": {
					const q = new URLSearchParams({
						voice_name: voice.arg,
						speak_text: text,
					}).toString();

					https
						.get(`https://voicedemo.codefactoryglobal.com/generate_audio.asp?${q}`, res)
						.on("error", rej);
					break;
				}
				case "cepstral": {
					let pitch = flags.pitch !== undefined ? +flags.pitch : 50;
					pitch /= 100;
					pitch *= 4.6;
					pitch -= 0.4;
					pitch = Math.round(pitch * 10) / 10;
					https.get("https://www.cepstral.com/en/demos", async (r) => {
						const cookie = r.headers["set-cookie"];
						const q = new URLSearchParams({
							voiceText: text,
							voice: voice.arg,
							createTime: 666,
							rate: 170,
							pitch: pitch,
							sfx: "none"
						}).toString();

						https.get(
							{
								hostname: "www.cepstral.com",
								path: `/demos/createAudio.php?${q}`,
								headers: { Cookie: cookie }
							},
							(r) => {
								let body = "";
								r.on("data", (b) => body += b);
								r.on("end", () => {
									const json = JSON.parse(body);

									https
										.get(`https://www.cepstral.com${json.mp3_loc}`, res)
										.on("error", rej);
								});
								r.on("error", rej);
							}
						).on("error", rej);
					}).on("error", rej);
					break;
				}
				case "vocalware": {
					const [EID, LID, VID] = voice.arg;
					const q = new URLSearchParams({
						EID,
						LID,
						VID,
						TXT: text,
						EXT: "mp3",
						FNAME: "",
						ACC: 15679,
						SceneID: 2703396,
						HTTP_ERR: "",
					}).toString();

					https
						.get(`https://cache-a.oddcast.com/tts/genB.php?${q}`, res)
						.on("error", rej);
					break;
				}
				case "acapela": {
					// generate a fake email
					let acapelaArray = [];
					for (let c = 0; c < 15; c++) acapelaArray.push(~~(65 + Math.random() * 26));
					const email = `${String.fromCharCode.apply(null, acapelaArray)}@gmail.com`;

					let req = https.request(
						{
							hostname: "acapelavoices.acapela-group.com",
							path: "/index/getnonce",
							method: "POST",
							headers: {
								"Content-Type": "application/x-www-form-urlencoded",
							},
						},
						(r) => {
							let buffers = [];
							r.on("data", (b) => buffers.push(b));
							r.on("end", () => {
								const nonce = JSON.parse(Buffer.concat(buffers)).nonce;
								let req = http.request(
									{
										hostname: "acapela-group.com",
										port: "8080",
										path: "/webservices/1-34-01-Mobility/Synthesizer",
										method: "POST",
										headers: {
											"Content-Type": "application/x-www-form-urlencoded",
										},
									},
									(r) => {
										let buffers = [];
										r.on("data", (d) => buffers.push(d));
										r.on("end", () => {
											const html = Buffer.concat(buffers);
											const beg = html.indexOf("&snd_url=") + 9;
											const end = html.indexOf("&", beg);
											const sub = html.subarray(beg, end).toString();

											http
												.get(sub, res)
												.on("error", rej);
										});
										r.on("error", rej);
									}
								).on("error", rej);
								req.end(
									new URLSearchParams({
										req_voice: voice.arg,
										cl_pwd: "",
										cl_vers: "1-30",
										req_echo: "ON",
										cl_login: "AcapelaGroup",
										req_comment: `{"nonce":"${nonce}","user":"${email}"}`,
										req_text: text,
										cl_env: "ACAPELA_VOICES",
										prot_vers: 2,
										cl_app: "AcapelaGroup_WebDemo_Android",
									}).toString()
								);
							});
						}
					).on("error", rej);
					req.end(
						new URLSearchParams({
							json: `{"googleid":"${email}"`,
						}).toString()
					);
					break;
				}
				case "voiceforge": {
					rej("VoiceForge has recently updated their API and due to this, the voices no longer work.\nWe do not have a fix for this at the moment.");
				}
				case "svox": {
					const q = new URLSearchParams({
						apikey: "e3a4477c01b482ea5acc6ed03b1f419f",
						action: "convert",
						format: "mp3",
						voice: voice.arg,
						speed: 0,
						text: text,
						version: "0.2.99",
					}).toString();

					https
						.get(`https://api.ispeech.org/api/rest?${q}`, res)
						.on("error", rej);
					break;
				}
				case "readloud": {
					const req = https.request(
						{
							hostname: "readloud.net",
							path: voice.arg,
							method: "POST",
							headers: { 
								"Content-Type": "application/x-www-form-urlencoded"
							}
						},
						(r) => {
							let buffers = [];
							r.on("data", (b) => buffers.push(b));
							r.on("end", () => {
								const html = Buffer.concat(buffers);
								const beg = html.indexOf("/tmp/");
								const end = html.indexOf("mp3", beg) + 3;
								const sub = html.subarray(beg, end).toString();

								https
									.get(`https://readloud.net${sub}`, res)
									.on("error", rej);
							});
						}
					).on("error", rej);
					req.end(
						new URLSearchParams({
							but1: text,
							butS: 0,
							butP: 0,
							butPauses: 0,
							but: "Submit",
						}).toString()
					);
					break;
				}
				case "cereproc": {
					const req = https.request(
						{
							hostname: "www.cereproc.com",
							path: "/themes/benchpress/livedemo.php",
							method: "POST",
							headers: {
								"content-type": "text/xml",
								"accept-encoding": "gzip, deflate, br",
								origin: "https://www.cereproc.com",
								referer: "https://www.cereproc.com/en/products/voices",
								"x-requested-with": "XMLHttpRequest",
								cookie: "Drupal.visitor.liveDemo=666",
							},
						},
						(r) => {
							var buffers = [];
							r.on("data", (d) => buffers.push(d));
							r.on("end", () => {
								const xml = String.fromCharCode.apply(null, brotli.decompress(Buffer.concat(buffers)));
								const beg = xml.indexOf("<url>") + 5;
								const end = xml.lastIndexOf("</url>");
								const loc = xml.substring(beg, end).toString();
								https.get(loc, res).on("error", rej);
							});
							r.on("error", rej);
						}
					);
					req.end(
						`<speakExtended key='666'><voice>${voice.arg}</voice><text>${text}</text><audioFormat>mp3</audioFormat></speakExtended>`
					);
					break;
				}
			}
		} catch (e) {
			rej(e);
		}
	});
};
