var Promise = global.Promise || require('es6-promise');
var zlib = require('zlib'), stream = require('stream');


exports.ZipFile = ZipFile;
exports.ZipEntry = ZipEntry;

exports.create = function (map) {
    var ret = new ZipFile();
    if (map && typeof map === 'object') {
        for (var keys = Object.keys(map), i = 0, L = keys.length; i < L; i++) {
            ret.add(keys[i], map[keys[i]]);
        }
    }
    return ret
};


function ZipFile() {
}

/**
 * Adds zip entry
 *
 * @param{string} name file name, must be valid path name
 * @param{Buffer} buffer
 * @param{Object} options
 */
ZipFile.prototype.add = function (name, buffer, options) {
    name = String(name);
    if (!/^[^/]+(?:\/[^\/]+)*/.test(name)) {
        throw new Error('Bad entry name: ' + name);
    }
    addDirEntry(this, name);
    var entry = this[name] = new ZipEntry(name, options);
    entry.buffer = buffer;
    entry.originalSize = buffer.length;
    entry.crc32 = crc32(buffer);

    if (entry.noCompress) {
        entry.compressed = buffer;
    }
};

function addDirEntry(file, name) {
    var idx = name.lastIndexOf('/') + 1;
    if (!idx) return;
    var parent = name.substr(0, idx);
    if (parent in file) return;
    var entry = file[parent] = new ZipEntry(parent);
    entry.isDir = true;
    addDirEntry(file, parent.substr(0, idx - 1));
}

ZipFile.prototype.zip = function () {
    var self = this;
    var names = Object.keys(this);
    return Promise.all(names.map(function (name) {
        try {
            return self[name]._compress();
        } catch (e) {
            console.error(e.message, name, self[name]);

            throw e;
        }
    })).then(function (zippedEntries) {
        // TODO build zip file
        var fileLen = 0;
        var nameBufs = [];
        for (var i = 0, L = names.length; i < L; i++) {
            var nameBuf = nameBufs[i] = new Buffer(names[i]), zippedBuf = zippedEntries[i];
            fileLen += (nameBuf.length << 1) + (zippedBuf ? zippedBuf.length : 0); // CONSTANT
        }
        fileLen += L * 76 + 22;
        var dest = new Buffer(fileLen), offset = 0;

        // write entries
        for (i = 0; i < L; i++) {
            var entry = self[names[i]];
            var options = entry.options;
            nameBuf = nameBufs[i];
            zippedBuf = zippedEntries[i];
            entry.offset = offset;
            offset = dest.writeUInt32BE(0x504B0304, offset, true); // 'PK',03,04
            offset = dest.writeUInt32BE(0, offset, true); // version needed to extract the file | flags
            offset = dest.writeUInt16LE(entry.noCompress ? 0 : 8, offset, true); // compress method
            offset = dest.writeUInt32LE(0, offset, true); // date and time
            offset = dest.writeUInt32LE(entry.crc32, offset, true); // crc32
            offset = dest.writeUInt32LE(entry.isDir ? 0 : zippedBuf.length, offset, true); // compressed size
            offset = dest.writeUInt32LE(entry.originalSize, offset, true); // uncompressed size
            offset = dest.writeUInt16LE(nameBuf.length, offset, true); // filename len
            offset = dest.writeUInt16LE(0, offset, true); // extra field length

            nameBuf.copy(dest, offset);
            offset += nameBuf.length;
            if (zippedBuf) {
                zippedBuf.copy(dest, offset);
                offset += zippedBuf.length;
            }
        }
        var directoryOffset = offset;
        // write central directory
        for (i = 0; i < L; i++) {
            entry = self[names[i]];
            options = entry.options;
            nameBuf = nameBufs[i];
            zippedBuf = zippedEntries[i];
            offset = dest.writeUInt32BE(0x504B0102, offset, true); // 'PK',01,02
            offset = dest.writeUInt32BE(0, offset, true); // version made by | version needed to extract
            offset = dest.writeUInt16LE(0, offset, true); // flags
            offset = dest.writeUInt16LE(entry.noCompress ? 0 : 8, offset, true); // compress method
            offset = dest.writeUInt32LE(0, offset, true); // date and time
            offset = dest.writeUInt32LE(entry.crc32, offset, true); // crc32
            offset = dest.writeUInt32LE(zippedBuf ? zippedBuf.length : 0, offset, true); // compressed size
            offset = dest.writeUInt32LE(entry.originalSize, offset, true); // uncompressed size
            offset = dest.writeUInt16LE(nameBuf.length, offset, true); // filename len
            offset = dest.writeUInt32LE(0, offset, true); // extra field length | file comment length
            offset = dest.writeUInt32LE(0, offset, true); // disk number | internal attribute
            offset = dest.writeUInt32LE(0, offset, true); // external attributes
            offset = dest.writeUInt32LE(entry.offset, offset, true); // entry offset

            nameBuf.copy(dest, offset);
            offset += nameBuf.length;
        }
        // end of central directory
        var directoryLen = offset - directoryOffset;
        offset = dest.writeUInt32BE(0x504B0506, offset, true); // 'PK',05,06
        offset = dest.writeUInt32LE(0, offset, true);
        offset = dest.writeUInt16LE(L, offset, true);
        offset = dest.writeUInt16LE(L, offset, true); // number of central directory records
        offset = dest.writeUInt32LE(directoryLen, offset, true); // number of central directory records
        offset = dest.writeUInt32LE(directoryOffset, offset, true); // number of central directory records
        offset = dest.writeUInt16LE(0, offset, true); // comment length
        return dest;
    });
};

ZipFile.prototype.entries = function () {
    var keys = Object.keys(this), cursor = 0, len = keys.length, self = this;
    var ret = {
        next: function () {
            if (cursor === len) {
                return {done: true}
            } else {
                var key = keys[cursor++];
                return {done: false, value: [key, self[key]]}
            }
        }
    };
    if (typeof Symbol === 'function' && Symbol.iterator) {
        ret[Symbol.iterator] = function () {
            return ret
        }
    }
    return ret;
};

if (typeof Symbol === 'function' && Symbol.iterator) {
    ZipFile.prototype[Symbol.iterator] = function () {
        var keys = Object.keys(this), cursor = 0, len = keys.length, self = this;
        return {
            next: function () {
                if (cursor === len) {
                    return {done: true}
                } else {
                    var key = keys[cursor++];
                    return {done: false, value: self[key]}
                }
            }
        };
    }
}

/**
 * default close method, do nothing
 */
ZipFile.prototype.close = function () {
};

ZipFile.prototype._closeHook = function (cb) {
    var _close = this.close;
    Object.defineProperty(this, 'close', {
        enumurable: false,
        configurable: true,
        value: function () {
            cb.call(this);
            _close.call(this);
        }
    });
    return this;
};

function ZipEntry(name, options) {
    this.name = name;
    this.options = options;
    if (this.noCompress = options && options.compressed === false) {
        options.level = 0;
    }

    this.buffer = this.compressed = null;
    this.originalSize = this.crc32 = 0;
    this._deflatePending = this._inflatePending = null;
    this.isDir = false;
}

ZipEntry.prototype.inflate = function () {
    if (this.buffer) { // uncompressed
        return Promise.resolve(this.buffer);
    }
    if (this._inflatePending) {
        return this._inflatePending;
    }
    var self = this;

    return this._inflatePending = new Promise(function (resolve) {
        var bufs = [];
        self.toReadStream().on('data', bufs.push.bind(bufs)).on('end', function () {
            self._inflatePending = null;
            resolve(Buffer.concat(bufs))
        });
    })
};

ZipEntry.prototype.toReadStream = function () {
    if (this.buffer) { // uncompressed
        var ret = new stream.Readable;
        ret.push(this.buffer);
        ret.push(null);
        return ret;
    }
    ret = zlib.createInflateRaw();
    this.pipe(ret);
    return ret;
};

ZipEntry.prototype._read = function () {
};

ZipEntry.prototype.pipe = function (writable) {
    var buf;
    if (this.compressed && !this.noCompress) {
        buf = this.compressed;
    } else if (this.buffer) { // from uncompressed
        var transform = zlib.createDeflateRaw(this.options);
        transform.pipe(writable);
        buf = this.buffer;
        writable = transform;
    } else {
        buf = this.compressed = this._read();
        delete this._read;
    }
    writable.write(buf);
    writable.end();
};

ZipEntry.prototype._compress = function () {
    if (this.isDir) {
        return null;
    }
    var compressed = this.compressed;
    if (compressed) {
        return Promise.resolve(compressed);
    }
    if (this._deflatePending) {
        return this._deflatePending;
    }
    var self = this;
    return this._deflatePending = new Promise(function (resolve, reject) {
        zlib.deflateRaw(self.buffer, self.options, function (err, buf) {
            if (err) {
                reject(err);
            } else {
                self._deflatePending = null;
                resolve(self.compressed = buf);
            }
        });
    });
};


// .zip file format parser
// Supply  a reader method to read from supplied buffer
function zipFile(fileLength, read, readAll) {
    var buf = read(fileLength - 22, 22);
    // read tail chunk

    if (buf.readUInt32BE(0) !== 0x504B0506) {
        throw new Error("Bad zip file format");
    }

    var dirsLength = buf.readUInt32LE(12, true),
        dirsOffset = buf.readUInt32LE(16, true);
    buf = read(dirsOffset, dirsLength);

    var ret = new ZipFile();

    for (var pos = 0, nextPos; pos < dirsLength; pos = nextPos) {
        if (buf.readUInt32BE(pos) !== 0x504B0102) { // read dir
            throw new Error("Bad zip file chunk");
        }
        var nameLen = buf.readUInt16LE(pos + 28);
        var name = buf.slice(pos + 46, pos + 46 + nameLen).toString(),
            isDir = name[name.length - 1] === '/',
            extraLen = buf.readUInt16LE(pos + 30),
            commentLen = buf.readUInt16LE(pos + 32);
        nextPos = pos + 46 + nameLen + extraLen + commentLen;
        //if (isDir) continue;

        var compressed = buf[pos + 10] !== 0;
        var entry = ret[name] = new ZipEntry(name, compressed ? null : {
            compressed: false
        });

        if (isDir) {
            entry.isDir = true;
            entry.crc32 = 0;
            entry.originalSize = 0;
        } else {
            entry.crc32 = buf.readUInt32LE(pos + 16);
            entry.originalSize = buf.readUInt32LE(pos + 24);
            var offset = buf.readUInt32LE(pos + 42) + 28,
                length = buf.readUInt32LE(pos + 20);
            offset += 2 + nameLen + read(offset, 2).readUInt16LE(0, true);

            if (readAll) {
                entry.compressed = read(offset, length);
                if (!compressed) {
                    entry.buffer = entry.compressed;
                }
            } else {
                entry._read = read.bind(null, offset, length);
            }
        }

    }
    return ret;
}


var fs = require('fs');
/**
 *
 * @param file a filename, or a fd, or a buffer
 * @returns {*}
 */
exports.unzip = function (file) {
    if (typeof file === 'string') {
        file = fs.openSync(file, 'r');
    }
    if (typeof file === 'number') {
        return zipFile(fs.fstatSync(file).size, function (offset, length) {
            var buf = new Buffer(length);
            for (var red = 0; red < length;) {
                red += fs.readSync(file, buf, red, length - red, offset + red);
            }
            return buf;
        }, false)._closeHook(function () {
            fs.closeSync(file);
        });
    } else if (Buffer.isBuffer(file)) {
        return zipFile(file.length, function (offset, length) {
            return file.slice(offset, offset + length)
        }, true);
    } else {
        throw new Error('Expected file path, fd, or a buffer');
    }
};

var crc_table = new Uint32Array(256);

for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) {
        var cr = c & 1;
        c = c >> 1 & 0x7FFFFFFF;
        if (cr) {
            c ^= 0xedb88320;
        }
    }
    crc_table[i] = c;
}

function crc32(arr) {
    var crc = -1;
    for (var i = 0, end = arr.length; i < end; i++) {
        crc = crc_table[crc & 0xFF ^ arr[i]] ^ (crc >> 8 & 0xFFFFFF);
    }
    return ~crc;
}