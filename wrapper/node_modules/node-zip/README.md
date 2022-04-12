# Node.JS zip file interpreter

This projects intends to create/read [PKZIP](http://en.wikipedia.org/wiki/PKZIP) file format.

## Install

    npm install kyriosli/node-zip

## Usage

```js
    var zip = require('node-zip');
    var zipFile = zip.create();
    // or
    var zipFile = zip.unzip('test.zip');

    zipFile.add('index.html', new Buffer('<p>Hello world</p>'));
    zipFile.zip().then(function(buffer) {
        fs.writeFile('test.zip', buffer);
    });

    // The following code shows how to response to a http request with content inside a zip file:
    var zipEntry = zipFile['index.html'];
    if(/\bdeflate\b/.test(req.headers['accept-encoding'])) {
        // write compressed content to browser
        res.setHeader('Content-Encoding', 'deflate');
        zipEntry.pipe(res);
    } else {
        res.setHeader('Content-Length', zipEntry.originalSize);
        zipEntry.toReadStream().pipe(res);
    }
```

## API Reference

### Module Methods

#### exports.create

    function create(optional object entries)

Creates a new `ZipFile`.

`entries` can be a map of file name and buffer that would be added to the zipFile created.

#### exports.unzip

    function unzip(string|number|Buffer file)

Creates a `ZipFile` from existing file. `file` can be a file path, or fd, or a buffer.

### class ZipFile

Represents a PKZIP file

#### Methods

##### ZipFile.add

    function add(string name, Buffer content, optional object options)

Adds a zip file entry

##### ZipFile\[name\]

Gets a zip file entry by its name. File Entry name is of UNIX file name format, with no heading slash, for example:
`README.md` or `test/index.js`

##### ZipFile.entries

    function entries()

Returns a file entry iterator, which yields `[name, entry]`

##### ZipFile\[Symbol.iterator\]

    function iterator()

Returns a file entry iterator, which yields `entry`

##### ZipFile.zip

    function zip()

Returns a `Promise`, which resolves a `buffer` when all file entries are compressed and joined together.

### class ZipEntry

Represents an entry of a PKZIP file

#### Fields

##### ZipEntry.name

The file name of this zip file entry. Note that non-ascii file names is treated as `UTF-8` encoded

##### ZipEntry.originalSize

The uncompressed size of the zipped file, in bytes.

##### ZipEntry.isDir

Whether a zip entry is directory.

##### ZipEntry.crc32

The crc32 checksum of the original content.

#### Methods

##### ZipEntry.inflate

    function inflate()

Returns a `Promise` that resolves a `buffer` when file entry content is read and inflated.

##### ZipEntry.toReadStream

    function toReadStream()

Returns a `stream.Readable` that contains the inflated content.

##### ZipEntry.pipe

    function pipe(Writable writable)

Writes the compressed content to a writable object.

  - If the ZipFile that contains this entry is created from original content, the content will be compressed.
  - Otherwise, the original compressed content will be written

Note that even `compressed = false` is given when adding a file entry, the file entry content is still compressed, with
options: `level = 0` which means no compression is performed, but zlib header and trailer will be appended.

