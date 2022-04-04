# [Audio Converter](https://www.npmjs.com/package/audio-converter)

A utility tool for batch converting wave files to ogg/mp3. This tool currently depends on [SoX](http://sox.sourceforge.net/).

## Install
```
npm install audio-converter;
apt-get install sox
```

## Usage

### Command Line
`audio-converter [options] <input-directory> <output-directory>`

### Node module
```javascript
var audioConverter = require("audio-converter");
audioConverter("path/to/waves", "path/to/output", {
    progressBar: true
}).then(function() {
    console.log("Done!");
});
```

## Options
### chunkSize, -c &lt;i&gt;
The number of files to be converted in parallel. Default: 100

### progressBar, -p
Display progress bar

### verbose, -v
Print additional information

### mp3Only, -m
Only generate MP3s

### oggOnly, -o
Only generate OGGs

### mp3Quality, -M &lt;n&gt;
MP3 quality argument provided to Sox. Default: 192
Pass `false` or `"false"` to use Sox built-in defaults.

### oggQuality, -O &lt;n&gt;
OGG quality argument provided to Sox. Default: 6
Pass `false` or `"false"` to use Sox built-in defaults.

## Testing

Install and run [Mocha](http://mochajs.org/)
```
npm install -g mocha;
mocha
```

## Bugs & Issues

If you find any problems with this module, feel free to create a new issue on the github page.

## Author

James Meyers

[GitHub](https://github.com/FullR)
