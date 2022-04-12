# mp3-duration ![Travis-Build](https://travis-ci.org/ddsol/mp3-duration.svg?branch=master)

> Calculate duration of an MP3


## Install

```
$ npm install --save mp3-duration
```

## Usage

```javascript
var mp3Duration = require('mp3-duration');

mp3Duration('file.mp3', function (err, duration) {
  if (err) return console.log(err.message);
  console.log('Your file is ' + duration + ' seconds long');
});
```

## API

## mp3Duration(filePathOrBuffer [, cbrEstimate] [, callback])

### filePathOrBuffer

Type: `string` | `Buffer`

Path to the file or a buffer with the file's contents

### cbrEstimate

Defaults to `false`. When set to `true`, will estimate the length of a
constant-bitrate mp3. This speeds up the calculation a lot but isn't
guaranteed to be accurate.

### callback(error, duration)

Type: `function`

Callback to be called once duration is calculated. It's also possible to
instead use the returned `Promise`. `duration` is the duration of the
mp3 in `ms`.

### Return value

`mp3Duration` returns a Promise that resolves to the duration of the mp3 in `ms` or rejects with some error.

## License

MIT © Han de Boer
