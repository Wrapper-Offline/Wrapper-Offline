describe("audio-converter", function() {
    var exec = require("child_process").exec,
        existsSync = require("fs").existsSync,
        outputDir = __dirname + "/../test-output",
        inputDir = __dirname + "/../test-files";

    // Makes sure all of the test files have been converted 
    // and placed in the output directory successfully.
    // Returns an array of errors
    function getOutputErrors() {
        var files = [
            "applause",
            "bar/apple",
            "bar/baboon",
            "bar/bench",
            "bar/fifty",
            "foo/bid",
            "foo/boater",
            "foo/fizz/actor",
            "foo/fizz/ball"
        ];

        return files.reduce(function(errors, file) {
            var ogg = outputDir + "/" + file + ".ogg",
                mp3 = outputDir + "/" + file + ".mp3";
            if(!existsSync(ogg)) {
                errors.push("Missing OGG: " + ogg);
            }
            if(!existsSync(mp3)) {
                errors.push("Missing MP3: " + mp3);
            }
            return errors;
        }, []);
    }

    it("should be able to create .ogg and .mp3 files using command line arguments", function(done) {
        exec([
            __dirname + "/../index.js",
            inputDir,
            outputDir
        ].join(" "), function() {
            var errors = getOutputErrors();

            if(errors.length) {
                done(errors.join("\n"));
            }
            else {
                done()
            }
        });
    });

    it("should be able to create .ogg and .mp3 files directly from javascript", function(done) {
        var audioConverter = require("../index");
        audioConverter(inputDir, outputDir).then(function() {
            var errors = getOutputErrors();

            if(errors.length) {
                done(errors.join("\n"));
            }
            else {
                done()
            }
        });
    });

    // Remove the output directory
    afterEach(function(done) {
        exec("rm -rf " + outputDir, function() {
            done();
        });
    });
});