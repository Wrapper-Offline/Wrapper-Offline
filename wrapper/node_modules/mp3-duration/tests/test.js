var assert = require('assert'),
  mp3Duration = require('../index.js'),
  fs = require('fs');

describe('mp3Duration', function() {

  it('returns a correct value for VBR duration', function(done) {
    mp3Duration('./tests/demo - vbr.mp3', function(err, length) {
      if (err) console.log(err.stack);
      assert.equal(err, null, (err || {}).message);
      assert.equal(length, 285.727, 'Length not as expected');
      done();
    });
  });

  it('returns a correct value for CBR duration with estimate', function(done) {
    mp3Duration('./tests/demo - cbr.mp3', true, function(err, length) {
      assert.equal(err, null, (err || {}).message);
      assert.equal(length, 285.727, 'Length not as expected');
      done();
    });
  });

  it('returns a correct value for CBR duration without estimate', function(done) {
    mp3Duration('./tests/demo - cbr.mp3', function(err, length) {
      assert.equal(err, null, (err || {}).message);
      assert.equal(length, 285.78, 'Length not as expected');
      done();
    });
  });

  it('returns a correct value for VBR duration when passing a buffer instead of a filename', function(done) {
    const buffer = fs.readFileSync('./tests/demo - vbr.mp3');

    mp3Duration(buffer, function(err, length) {
      if (err) console.log(err.stack);
      assert.equal(err, null, (err || {}).message);
      assert.equal(length, 285.727, 'Length not as expected');
      done();
    });
  });

  it('return a correct value for CBR duration without estimate when passing a buffer instead of a filename', function(done) {
    const buffer = fs.readFileSync('./tests/demo - cbr.mp3');

    mp3Duration(buffer, function(err, length) {
      assert.equal(err, null, (err || {}).message);
      assert.equal(length, 285.78, 'Length not as expected');
      done();
    });
  });

});
