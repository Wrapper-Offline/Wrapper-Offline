const httpz = require("@octanuary/httpz")
const app = require("./app");
const asset = require("./asset");
const char = require("./char");
const movie = require("./movie");
const theme = require("./theme");
const settings = require("./settings");
const tts = require("./tts");
const watermark = require("./watermark");
const waveform = require("./waveform");
const group = new httpz.Group();

group.add(app);
group.add(asset);
group.add(char);
group.add(movie);
group.add(theme);
group.add(settings);
group.add(tts);
group.add(watermark);
group.add(waveform);

module.exports = group;
