const loadPost = require('../request/post_body');
const mp3Duration = require('mp3-duration');
const voices = require('./info').voices;
const asset = require('../asset/main');
const get = require('../request/get');
const qs = require('querystring');
const brotli = require('brotli');
const md5 = require("js-md5");
const base64 = require("js-base64");
const https = require('https');
const http = require('http');

function processVoice(voiceName, text) {
	return new Promise((res, rej) => {
		const voice = voices[voiceName];
		switch (voice.source) {
			case "polly": {
				https.get('https://voicemaker.in/', r => {
					const cookie = r.headers['set-cookie'];
					var req = https.request({
						hostname: "voicemaker.in",
						port: "443",
						path: "/voice/standard",
						method: "POST",
						headers: {
							"content-type": "application/json",
							cookie: cookie,
							"csrf-token": "",
							origin: "https://voicemaker.in",
							referer: "https://voicemaker.in/",
							"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
							"x-requested-with": "XMLHttpRequest",
						},
					},
					(r) => {
						var buffers = [];
						r.on("data", (b) => buffers.push(b));
						r.on("end", () => {
							var json = JSON.parse(Buffer.concat(buffers));
							get(`https://voicemaker.in${json.path.replace(".", "")}`).then(res).catch(rej);
						});
						r.on("error", rej);
					});
					req.write(`{"Engine":"${voice.polly_engine}","Provider":"ai101","OutputFormat":"mp3","VoiceId":"${voice.arg}","LanguageCode":"${voice.language}-${voice.country}","SampleRate":"22050","effect":"default","master_VC":"advanced","speed":"0","master_volume":"0","pitch":"0","Text":"${text}","TextType":"text","fileName":""}`);
					req.end();
				});
				break;
			}
			/* WARNING: NUANCE TTS API HAS BACKGROUND MUSIC */
            case "nuance": {
                var q = qs.encode({
                    voice_name: voice.arg,
                    speak_text: text,
                });
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
			case "cepstral": {
				https.get('https://www.cepstral.com/en/demos', r => {
					const cookie = r.headers['set-cookie'];
					var q = qs.encode({
						voiceText: text,
						voice: voice.arg,
						createTime: 666,
						rate: 170,
						pitch: 1,
						sfx: 'none',
					});
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
			case "vocalware": {
				var [eid, lid, vid] = voice.arg;
				var cs = md5(`${eid}${lid}${vid}${text}1mp35883747uetivb9tb8108wfj`);
				var q = qs.encode({
					EID: voice.arg[0],
					LID: voice.arg[1],
					VID: voice.arg[2],
					TXT: text,
					EXT: "mp3",
					IS_UTF8: 1,
					ACC: 5883747,
					cache_flag: 3,
					CS: cs,
				});
				var req = https.get(
					{
						host: "cache-a.oddcast.com",
						path: `/tts/gen.php?${q}`,
						headers: {
							Referer: "https://www.oddcast.com/",
							Origin: "https://www.oddcast.com/",
							"User-Agent":
								"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
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
			case "watson": {
				var q = qs.encode({
					text: text,
					voice: voice.arg,
					download: true,
					accept: "audio/mp3",
				});
				https.get(
					{
						host: "text-to-speech-demo.ng.bluemix.net",
						path: `/api/v3/synthesize?${q}`,
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
								qs.encode({
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
								})
							);
						});
					}
				);
				req.end(
					qs.encode({
						json: `{"googleid":"${email}"`,
					})
				);
				break;
			} */
            case "acapela": {
                var buffers = [];
                var req = https.request({
                        hostname: "acapela-box.com",
                        path: "/AcaBox/dovaas.php",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
							Cookie: "AcaBoxLogged=logged; AcaBoxUsername=goaniwrap; acabox=92s39r5vu676g5ekqehbu2o0f2; AcaBoxFirstname=Keegan",
							Origin: "https://acapela-box.com",
                            Referer: "https://acapela-box.com/AcaBox/index.php",
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
                        },
                    },
                    (r) => {
                        r.on("data", (b) => buffers.push(b));
                        r.on("end", () => {
                            var json = JSON.parse(Buffer.concat(buffers));
							get(`${json.snd_url}`).then(res).catch(rej);
                        });
                    }
                );
                req.write(qs.encode({
                    text: text,
                    voice: voice.arg,
					listen: 1,
					format: "MP3",
					codecMP3: 1,
					spd: 180,
					vct: 100,
					byline: 0,
					ts: 666
                }));
                req.end();
                break;
            }
			case "acapelaOld": {
				var q = qs.encode({
					inputText: base64.encode(text),
				});
				https.get(
					{
						host: "voice.reverso.net",
						path: `/RestPronunciation.svc/v1/output=json/GetVoiceStream/voiceName=${voice.arg}?${q}`,
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
			case "voiceforge": {
				/* Special thanks to ItsCrazyScout for helping us find the new VoiceForge link and being kind enough to host xom's VFProxy on his site! */
				var q = qs.encode({
					voice: voice.arg,
					msg: text,
				});
				http.get(
					{
						host: "localhost",
						port: "8181",
						path: `/vfproxy/speech.php?${q}`,
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
			case "svox": {
				var q = qs.encode({
					apikey: "e3a4477c01b482ea5acc6ed03b1f419f",
					action: "convert",
					format: "mp3",
					voice: voice.arg,
					speed: 0,
					text: text,
					version: "0.2.99",
				});
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
			}
			case "wavenet": {
                var req = https.request({
                        hostname: "texttospeechapi.wideo.co",
                        path: "/api/wideo-text-to-speech",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
							Origin: "https://texttospeech.wideo.co",
							Referer: "https://texttospeech.wideo.co/",
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
                        },
                    },
                    (r) => {
						var buffers = [];
						r.on("data", (b) => buffers.push(b));
                        r.on("end", () => {
							var json = JSON.parse(Buffer.concat(buffers));
							get(`${json.url}`).then(res).catch(rej);
						});
						r.on("error", rej);
					});
					req.write(`{"data":{"text":"${text}","speed":1,"voice":"${voice.arg}"}}`);
					req.end();
					break;
			}
			/*
			case "acapela": {
				var q = qs.encode({
					cl_login: "VAAS_MKT",
					req_snd_type: "",
					req_voice: voice.arg,
					cl_app: "seriousbusiness",
					req_text: text,
					cl_pwd: "M5Awq9xu",
				});
				http.get(
					{
						host: "vaassl3.acapela-group.com",
						path: `/Services/AcapelaTV/Synthesizer?${q}`,
					},
					(r) => {
						var buffers = [];
						r.on("data", (d) => buffers.push(d));
						r.on("end", () => {
							const html = Buffer.concat(buffers);
							const beg = html.indexOf("&snd_url=") + 9;
							const end = html.indexOf("&", beg);
							const sub = html.subarray(beg + 4, end).toString();
							if (!sub.startsWith("://")) return rej();
							get(`https${sub}`).then(res).catch(rej);
						});
						r.on("error", rej);
					}
				);
				break;
			}
			*/
			case "readloud": {
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
							const loc = `https://readloud.net${sub}`;

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
					qs.encode({
						but1: text,
						butS: 0,
						butP: 0,
						butPauses: 0,
						but: "Submit",
					})
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
							const beg = xml.indexOf("https://cerevoice.s3.amazonaws.com/");
							const end = xml.indexOf(".mp3", beg) + 4;
							const loc = xml.substr(beg, end - beg).toString();
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

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/convertTextToSoundAsset/') return;
	loadPost(req, res).then(data => {
		processVoice(data.voice, data.text).then(buffer => {
			mp3Duration(buffer, (e, duration) => {
				if (e || !duration) return res.end(1 + process.env.FAILURE_XML);

				const title = `[${voices[data.voice].desc}] ${data.text}`;
				const id = asset.saveLocal(buffer, data.presaveId, '-tts.mp3');
				res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${title}</title><published>0</published><tags></tags><duration>${1e3 * duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`)
			});
		});
	});
	return true;
}
