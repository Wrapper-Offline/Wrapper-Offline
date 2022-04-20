/**
 * Simple test of pace.js.
 *
 * Play with maxBurden to see how it effects total execution speed and the
 * progress bar refresh rate.
 */

var total = 50000,
    count = 0,
    pace = require('../')({total: total, showBurden: true, maxBurden: 0.5});

while (count++ < total) {
  pace.op();

  // Cause some work to be done.
  for (var i = 0; i < 1000000; i++) {
    count = count;
  }
}
