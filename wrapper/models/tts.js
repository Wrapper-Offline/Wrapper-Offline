const brotli = require("brotli");
const { convertToMp3 } = require("../../utils/fileUtil.js");
const https = require("https");
const voices = require("../data/voices.json").voices;

/**
 * uses tts demos to generate tts
 * @param {string} voiceName
 * @param {string} text
 * @returns {Promise<IncomingMessage>}
 */
module.exports = function processVoice(voiceName, rawText) {
	return new Promise((res, rej) => {
		const voice = voices[voiceName];
		if (!voice) {
			return rej("The voice you requested is unavailable.");
		}

		let flags = {};
		const pieces = rawText.split("#%");
		let text = pieces.pop().substring(0, 180);
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
							r.on("data", (c) => body += c);
							r.on("end", () => {
								const json = JSON.parse(body);
								if (json.Error == 1) {
									return rej(json.Text);
								}

								https
									.get(json.URL, res)
									.on("error", rej);
							});
							r.on("error", rej);
						}
					)
					req.on("error", rej);
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
					let pitch;
					if (flags.pitch) {
						pitch = +flags.pitch;
						pitch /= 100;
						pitch *= 4.6;
						pitch -= 0.4;
						pitch = Math.round(pitch * 10) / 10;
					} else {
						pitch = 1;
					}
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

				case "voiceforge": {
					const q = new URLSearchParams({						
						msg: text,
						voice: voice.arg,
						email: "null"
					}).toString();
					
					https.get({
						hostname: "api.voiceforge.com",
						path: `/swift_engine?${q}`,
						headers: { 
							"User-Agent": "just_audio/2.7.0 (Linux;Android 11) ExoPlayerLib/2.15.0",
							"HTTP_X_API_KEY": "8b3f76a8539",
							"Accept-Encoding": "identity",
							"Icy-Metadata": "1",
						}
					}, (r) => {
						convertToMp3(r, "wav").then(res).catch(rej);
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

					console.log(`https://cache-a.oddcast.com/tts/genB.php?${q}`)
					https
						.get(
							{
								hostname: "cache-a.oddcast.com",
								path: `/tts/genB.php?${q}`,
								headers: {
									"Host": "cache-a.oddcast.com",
									"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
									"Accept": "*/*",
									"Accept-Language": "en-US,en;q=0.5",
									"Accept-Encoding": "gzip, deflate, br",
									"Origin": "https://www.oddcast.com",
									"DNT": 1,
									"Connection": "keep-alive",
									"Referer": "https://www.oddcast.com/",
									"Sec-Fetch-Dest": "empty",
									"Sec-Fetch-Mode": "cors",
									"Sec-Fetch-Site": "same-site"
								}
							}, res
						)
						.on("error", rej);
					break;
				}

				case "acapela": {
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
								let req = https.request(
									{
										hostname: "acapela-group.com",
										port: "8443",
										path: "/Services/Synthesizer",
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

											https
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
							hostname: "101.99.94.14",														
							path: voice.arg,
							method: "POST",
							headers: { 			
								Host: "gonutts.net",					
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
								const path = html.subarray(beg, end).toString();

								if (path.length > 0) {
									https.get({
										hostname: "101.99.94.14",	
										path: `/${path}`,
										headers: {
											Host: "gonutts.net"
										}
									}, res)
										.on("error", rej);
								} else {
									return rej("Could not find voice clip file in response.");
								}
							});
						}
					);
					req.on("error", rej);
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
					req.on("error", rej);
					req.end(
						`<speakExtended key='666'><voice>${voice.arg}</voice><text>${text}</text><audioFormat>mp3</audioFormat></speakExtended>`
					);
					break;
				}

				case "tiktok": {
					const req = https.request(
						{
							hostname: "tiktok-tts.weilnet.workers.dev",
							path: "/api/generation",
							method: "POST",
							headers: {
								"Content-type": "application/json"
							}
						},
						(r) => {
							let body = "";
							r.on("data", (b) => body += b);
							r.on("end", () => {
								const json = JSON.parse(body);
								if (json.success !== true) {
									return rej(json.error);
								}

								res(Buffer.from(json.data, "base64"));
							});
							r.on("error", rej);
						}
					).on("error", rej);
					req.end(JSON.stringify({
						text: text,
						voice: voice.arg
					}));
					break;
				}
			}
		} catch (e) {
			return rej(e);
		}
	});
};
