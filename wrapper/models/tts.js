/**
 * tts api
 */
// modules
const https = require("https");
// vars
const voices = require("../data/voices.json").voices;

/**
 * uses tts demos to generate tts
 * @param {string} voiceName voice name
 * @param {string} text text
 * @returns {IncomingMessage}
 */
module.exports = function processVoice(voiceName, text) {
	return new Promise(async (res, rej) => {
		const voice = voices[voiceName];
		switch (voice.source) {
			case "polly": {
				// make sure it's under the char limit
				text = text.substring(0, 181);
				const body = new URLSearchParams({
					msg: text,
					lang: voice.arg,
					source: "ttsmp3"
				}).toString();

				const response = await fetch(
					"https://ttsmp3.com/makemp3_new.php",
					{
						body,
						method: "POST",
						headers: {
							"Content-Length": body.length,
							"Content-type": "application/x-www-form-urlencoded"
						}
					}
				);
				const json = await response.json();
				if (json.Error == 1) rej(json.Text);
				
				https.get(json.URL, res);
				break;
			}
		}
	});
};
