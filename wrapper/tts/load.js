/**
 * route
 * tts generation
 */
// TODO: convert all of this to the fetch api
// modules
const base64 = require("js-base64");
const brotli = require("brotli");
const https = require("https");
const http = require("http");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const md5 = require("js-md5");
const mp3Duration = require("mp3-duration");
// vars
// firefox is good
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0";
const voices = require("./info").voices;
// stuff
const asset = require("../asset/main");
const { xmlFail } = require("../request/extend");
const get = require("../request/get");
const processVoice = (voiceName, text) => {
	return new Promise((res, rej) => {
		const voice = voices[voiceName];
		switch (voice.source) {
			case "polly": { // working, stops working after some time
				// make sure it's under the char limit
				text = text.substring(0, 2999);

				const body = new URLSearchParams({
					msg: text,
					lang: voice.arg,
					source: "ttsmp3"
				}).toString();
				var req = https.request(
					{
						hostname: "ttsmp3.com",
						port: "443",
						path: "/makemp3_new.php",
						method: "POST",
						headers: {
							"Content-Length": body.length,
							"Content-type": "application/x-www-form-urlencoded"
						}
					},
					(r) => {
						let buffers = [];
						r.on("data", (d) => buffers.push(d));
						r.on("end", () => {
							const json = JSON.parse(Buffer.concat(buffers).toString());
							if (json.Error != 0) rej(json.Text);

							get(json.URL)
								.then(res)
								.catch(rej);
						});
						r.on("error", rej);
					}
				);
				req.write(body);
				req.end();
				break;
			}
			/* WARNING: NUANCE TTS API HAS BACKGROUND MUSIC


			shut up xomdjl
			*/
			case "nuance": { // working
				var q = new URLSearchParams({
					voice_name: voice.arg,
					speak_text: text,
				}).toString();
				https.get({
						host: "voicedemo.codefactoryglobal.com",
						path: `/generate_audio.asp?${q}`,
					},
					(r) => {
						var buffers = [];
						r.on("data", (d) => buffers.push(d));
						r.on("end", () => res(Buffer.concat(buffers)));
						r.on("error", rej);
					}
				);
				break;
			}
			case "cepstral": { // working
				https.get('https://www.cepstral.com/en/demos', r => {
					const cookie = r.headers['set-cookie'];
					var q = new URLSearchParams({
						voiceText: text,
						voice: voice.arg,
						createTime: 666,
						rate: 170,
						pitch: 1,
						sfx: 'none',
					}).toString();
					var buffers = [];
					var req = https.get({
						host: 'www.cepstral.com',
						path: `/demos/createAudio.php?${q}`,
						headers: { Cookie: cookie },
						method: 'GET',
					}, r => {
						r.on('data', b => buffers.push(b));
						r.on('end', () => {
							var json = JSON.parse(Buffer.concat(buffers));
							get(`https://www.cepstral.com${json.mp3_loc}`).then(res).catch(rej);
						})
					});
				});
				break;
			}
			case "vocalware": { // working
				var [eid, lid, vid] = voice.arg;
				var cs = md5(`${eid}${lid}${vid}${text}1mp35883747uetivb9tb8108wfj`);
				var q = new URLSearchParams({
					EID: voice.arg[0],
					LID: voice.arg[1],
					VID: voice.arg[2],
					TXT: text,
					EXT: "mp3",
					IS_UTF8: 1,
					ACC: 5883747,
					cache_flag: 3,
					CS: cs,
				}).toString();
				var req = https.get(
					{
						host: "cache-a.oddcast.com",
						path: `/tts/gen.php?${q}`,
						headers: {
							Referer: "https://www.oddcast.com/",
							Origin: "https://www.oddcast.com/",
							"User-Agent": userAgent,
						},
					},
					(r) => {
						var buffers = [];
						r.on("data", (d) => buffers.push(d));
						r.on("end", () => res(Buffer.concat(buffers)));
						r.on("error", rej);
					}
				);
				break;
			}
			/* case "acapela": {
				var buffers = [];
				var acapelaArray = [];
				for (var c = 0; c < 15; c++) acapelaArray.push(~~(65 + Math.random() * 26));
				var email = `${String.fromCharCode.apply(null, acapelaArray)}@gmail.com`;
				var req = https.request(
					{
						hostname: "acapelavoices.acapela-group.com",
						path: "/index/getnonce",
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					},
					(r) => {
						r.on("data", (b) => buffers.push(b));
						r.on("end", () => {
							var nonce = JSON.parse(Buffer.concat(buffers)).nonce;
							var req = http.request(
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
									var buffers = [];
									r.on("data", (d) => buffers.push(d));
									r.on("end", () => {
										const html = Buffer.concat(buffers);
										const beg = html.indexOf("&snd_url=") + 9;
										const end = html.indexOf("&", beg);
										const sub = html.subarray(beg, end).toString();
										http.get(sub, (r) => {
											r.on("data", (d) => buffers.push(d));
											r.on("end", () => {
												res(Buffer.concat(buffers));
											});
										});
									});
									r.on("error", rej);
								}
							);
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
				);
				req.end(
					new URLSearchParams({
						json: `{"googleid":"${email}"`,
					}).toString()
				);
				break;
			} */
			case "acapela": {
				var buffers = [];
				var acapelaArray = [];
				for (var c = 0; c < 15; c++) acapelaArray.push(~~(65 + Math.random() * 26));
				var email = `${String.fromCharCode.apply(null, acapelaArray)}@gmail.com`;
				var req = https.request(
					{
						hostname: "acapelavoices.acapela-group.com",
						path: "/index/getnonce",
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					},
					(r) => {
						r.on("data", (b) => buffers.push(b));
						r.on("end", () => {
							var nonce = JSON.parse(Buffer.concat(buffers)).nonce;
							var req = http.request(
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
									var buffers = [];
									r.on("data", (d) => buffers.push(d));
									r.on("end", () => {
										const html = Buffer.concat(buffers);
										const beg = html.indexOf("&snd_url=") + 9;
										const end = html.indexOf("&", beg);
										const sub = html.subarray(beg, end).toString();
										http.get(sub, (r) => {
											r.on("data", (d) => buffers.push(d));
											r.on("end", () => {
												res(Buffer.concat(buffers));
											});
										});
									});
									r.on("error", rej);
								}
							);
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
				);
				req.end(
					new URLSearchParams({
						json: `{"googleid":"${email}"`,
					}).toString()
				);
				break;
			}
			case "voiceforge": { // working, requires lame installation
				const q = new URLSearchParams({
					"HTTP-X-API-KEY": "9a272b4",
					msg: text,
					voice: voice.arg,
					email: null
				}).toString();
				let url = `https://api.voiceforge.com/swift_engine?${q}`;
				https.get(url, (r) => {
					let buffers = [];
					const command = ffmpeg(r)
						.inputFormat("wav")
						.toFormat("mp3")
						.on("error", rej);
					const stream = command.pipe();
					stream.on("data", b => buffers.push(b));
					stream.on("end", () => {
						res(Buffer.concat(buffers));
					});
				});
				break;
			}
			case "svox": { // working
				var q = new URLSearchParams({
					apikey: "e3a4477c01b482ea5acc6ed03b1f419f",
					action: "convert",
					format: "mp3",
					voice: voice.arg,
					speed: 0,
					text: text,
					version: "0.2.99",
				}).toString();
				https.get(
					{
						host: "api.ispeech.org",
						path: `/api/rest?${q}`,
					},
					(r) => {
						var buffers = [];
						r.on("data", (d) => buffers.push(d));
						r.on("end", () => res(Buffer.concat(buffers)));
						r.on("error", rej);
					}
				);
				break;
			} case "readloud": { // working
				const req = https.request(
					{
						host: "readloud.net",
						port: 443,
						path: voice.arg,
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							"User-Agent":
								"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
						},
					},
					(r) => {
						var buffers = [];
						r.on("data", (d) => buffers.push(d));
						r.on("end", () => {
							const html = Buffer.concat(buffers);
							const beg = html.indexOf("/tmp/");
							const end = html.indexOf(".mp3", beg) + 4;
							const sub = html.subarray(beg, end).toString();

							https.get(
								{
									host: "readloud.net",
									path: sub,
									headers: {
										"Content-Type": "application/x-www-form-urlencoded",
										"User-Agent":
											"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
									},
								},
								(r) => {
									buffers = [];
									r.on("data", (d) => buffers.push(d));
									r.on("end", () => res(Buffer.concat(buffers)));
								}
							);
						});
						r.on("error", rej);
					}
				);
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
			} case "cereproc": { // working
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
							get(loc).then(res).catch(rej);
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
	});
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/goapi/convertTextToSoundAsset/") return;
	const { voice, text } = req.body;
	if (!voice || !text) {
		res.statusCode = 400;
		res.end();
		return true;
	}

	try {
		const buffer = await processVoice(voice, text);
		mp3Duration(buffer, (e, duration) => {
			if (e || !duration) throw new Error(e);

			const meta = {
				type: "sound",
				subtype: "tts",
				title: `[${voices[voice].desc}] ${text}`,
				duration: 1e3 * duration,
				ext: "mp3",
				themeId: "ugc"
			}
			const id = asset.save(buffer, meta);
			res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`)
		});
	} catch (err) {
		console.error("Error generating TTS: " + err);
		res.statusCode = 500;
		res.end("1" + xmlFail("Internal server error."));
	};
	return true;
}
