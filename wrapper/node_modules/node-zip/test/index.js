var assertEqual = require('assert').strictEqual,
    fs = require('fs');

var zip = require('../');

var zipFile = zip.create({
    'package.json': fs.readFileSync('package.json')
});
console.log('exports.create: ok');

zipFile.add('index.js', fs.readFileSync('index.js'), {
    level: 9
});
console.log('ZipFile.add: ok');

zipFile.add('test/index.js', fs.readFileSync(__filename), {
    compressed: false
});
//console.log(zipFile);
var transform = require('zlib').createInflateRaw();
var bufs = [];
transform.on('data', bufs.push.bind(bufs)).on('end', function () {
    assertEqual(Buffer.concat(bufs).toString(), fs.readFileSync(__filename, 'utf8'));
    console.log('zipEntry.pipe: ok(compressed=false)')
});

zipFile['test/index.js'].pipe(transform);

zipFile.zip().then(function (buffer) {
    console.log('ZipFile.zip: ok');
    fs.writeFileSync('test.zip', buffer);


    var zipFile = zip.unzip(buffer);
    console.log('exports.unzip(buffer): ok');

    assertEqual(zipFile['test/index.js'].noCompress, true);
    assertEqual(zipFile['test/index.js'].buffer.toString(), fs.readFileSync(__filename, 'utf8'));
    console.log('ZipFile.add(compressed: false): ok');

    zipFile['package.json'].inflate().then(function (buf) {
        assertEqual(buf.toString(), fs.readFileSync('package.json', 'utf8'));
        console.log('ZipEntry.inflate: ok');
    }).then(null, onerror);

    zipFile = zip.unzip('test.zip');
    console.log('exports.unzip(file): ok');
    var str = '', decoder = new (require('string_decoder').StringDecoder)('utf8');

    zipFile['package.json'].toReadStream().on('data', function (data) {
        str += decoder.write(data)
    }).on('end', function () {
        assertEqual(str, fs.readFileSync('package.json', 'utf8'));
        console.log('ZipEntry.toReadStream: ok');
        zipFile.close();
    });

    return zipFile

}).then(function (zipFile) {
    zipFile.add('README.md', fs.readFileSync('README.md'));
    zipFile.add('utf8/测试.txt', new Buffer('中文'));
    console.log('ZipFile(unzipped).add: ok');
    return zipFile.zip();
}).then(function (buffer) {
    console.log('ZipFile(unzipped).zip: ok');
    fs.writeFileSync('test.zip', buffer);
}).then(null, onerror);


function onerror(err) {
    console.error(err.stack);
}