var zip = require('../');

var zipFile = zip.unzip('test.zip');
for (var entry of zipFile) {
    console.log(entry);
}
for (var entry of zipFile.entries()) {
    console.log(entry);
}