#!/usr/bin/env node

const pkg    = require("./package");
const path   = require("path");                         // parse/build file paths
const Q      = require("q");                            // Promise library
const chunk  = require("lodash.chunk");
const uniq  = require("lodash.uniq");
const Pace   = require("pace");                         // progress bar
const glob   = Q.nfbind(require("glob"));               // filepath pattern matching
const mkdirp = Q.nfbind(require("mkdirp"));             // mkdir -p
const exec   = Q.nfbind(require("child_process").exec); // for running sox commands
const wavRegex = /.wav$/;

const defaultMp3Quality = "192";
const defaultOggQuality = "6";
const defaultChunkSize = 100;

if(require.main === module) { // called directly
    const program = require("commander"); // parsing command line arguments
    program
        .version(pkg.version)
        .usage("[options] <input-directory> <output-directory>")
        .option("-c, --chunkSize <i>", "The number of files to be converted in parallel. Default: " + defaultChunkSize, parseInt)
        .option("-p, --progressBar", "Display progress bar")
        .option("-v, --verbose", "Print additional information")
        .option("-m, --mp3Only", "Only generate MP3s")
        .option("-o, --oggOnly", "Only generate OGGs")
        .option("-M, --mp3Quality <n>", "MP3 quality argument provided to Sox. Default: " + defaultMp3Quality)
        .option("-O, --oggQuality <n>", "OGG quality argument provided to Sox. Default: " + defaultOggQuality)
        .parse(process.argv);

    if(program.args.length < 2) {
        program.outputHelp();
    }
    else {
        convertDirectory(program.args[0], program.args[1], program)
            .catch(function(error) {
                console.log("Error: " + error);
            });
    }
}
else { // required as a module
    module.exports = convertDirectory;
}

// Convert all .wav files in `inputDir` into .ogg and .mp3 files and output them to `outputDir`
function convertDirectory(inputDir, outputDir, options) {
    var mp3Quality,
        oggQuality,
        chunkSize,
        fileCount,
        pace,
        started = new Date();

    inputDir = resolvePath(inputDir);
    outputDir = resolvePath(outputDir);
    options = options || {};
    mp3Quality = options.mp3Quality || defaultMp3Quality;
    oggQuality = options.oggQuality || defaultOggQuality;
    chunkSize = options.chunkSize || defaultChunkSize;
    mp3Only = options.mp3Only;
    oggOnly = options.oggOnly;
    progressBar = options.progressBar;

    if(typeof chunkSize === "number" && chunkSize <= 0) {
        return Q.reject("Chunk size must be a positive integer");
    }
    if(mp3Only && oggOnly) {
        return Q.reject("Cannot use both mp3Only and oggOnly flags at the same time");
    }

    return Q.resolve()
        .then(glob.bind(null, path.join(inputDir, "/**/*.wav")))
        .then(function(files) {
            return files.filter(function(file) { // filter out all non-wave files
                return file.match(wavRegex);
            });
        })
        .then(function(files) {
            var outDirectories = uniq(files.map(path.dirname)).map(function(directory) {
                return directory.replace(inputDir, outputDir);
            });
            fileCount = files.length;
            if(progressBar) {
                pace = Pace({total: fileCount}); // progress bar
                pace.op(-1); // can't use op(0) to force an initial render
                pace.op();
            }
            return Q.all(outDirectories.map(function(dir) {
                return mkdirp(dir);
            })).then(function() {
                return files;
            });
        })
        .then(function(files) {
            verbose("Converting with chunk size " + chunkSize);
            return chunk(files, chunkSize).reduce(function(promise, chunk) {
                return promise.then(function() { // after the last chunk has finished
                    return Q.all(chunk.map(convertFile));
                });
            }, Q.resolve());
        })
        .then(function() {
            if(!progressBar) {
                verbose("Finished converting " + fileCount + " files in " + Math.abs(new Date() - started) + " ms");
            }
        });

    // Convert a file to ogg, mp3, or both depending on mp3Only/oggOnly flags
    function convertFile(file) {
        var promise;
        if(mp3Only) {
            promise = buildMP3(file, inputDir, outputDir, mp3Quality);
        }
        else if(oggOnly) {
            promise = buildOGG(file, inputDir, outputDir, oggQuality);
        }
        else {
            promise = Q.all([
                buildOGG(file, inputDir, outputDir, oggQuality),
                buildMP3(file, inputDir, outputDir, mp3Quality)
            ]);
        }
        return promise
            .then(function() {
                if(progressBar) {
                    pace.op();
                }
            });
    }

    /*
        Converts a .wav sound file to a .ogg sound file
        Arguments:
            inFile - File to be converted
            inBase - Base path of the file to be converted
            outBase - Base path of the output
            quality - Quality argument provided to Sox
    */
    function buildOGG(inFile, inBase, outBase, quality) {
        var inDir = path.dirname(inFile),
            outFile = inFile.replace(new RegExp("^"+inBase), outBase).replace(wavRegex, ".ogg");

        verbose("Generating OGG");
        verbose("    " + inFile);
        verbose("    " + outFile);
        return exec([
            "sox",
            "'"+inFile+"'",
            (quality === false || quality === "false") ? "" : "-C"+quality,
            "'" + outFile + "'"
        ].join(" "));
    }

    /*
        Converts a .wav sound file to a .mp3 sound file
        Arguments:
            inFile - File to be converted
            inBase - Base path of the file to be converted
            outBase - Base path of the output
            quality - Quality argument provided to Sox
    */
    function buildMP3(inFile, inBase, outBase, quality) {
        var inDir = path.dirname(inFile),
            outFile = inFile.replace(new RegExp("^"+inBase), outBase).replace(wavRegex, ".mp3");

        verbose("Generating MP3");
        verbose("    " + inFile);
        verbose("    " + outFile);
        return exec([
            "sox",
            "'" + inFile + "'",
            (quality === false || quality === "false") ? "" : "-C"+quality,
            "'" + outFile + "'"
        ].join(" "));
    }

    // log if in verbose mode
    function verbose() {
        if(options.verbose) {
            return console.log.apply(console, arguments);
        }
    }
}

// Same as `path.resolve` except this function handles "~" in path strings
function resolvePath(string) {
    if(string[0] === '~') {
        string = process.env.HOME + string.substr(1)
    }
    return path.resolve(string);
}
