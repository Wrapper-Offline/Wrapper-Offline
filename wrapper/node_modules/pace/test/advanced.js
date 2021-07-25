/**
 * Advanced test of pace.js.
 *
 * Set the current position in op() and also randomly increase the total.
 */

var total = 50000,
    current = 0,
    pace = require('../')(total);

while (current++ < total) {
  if (Math.random() > 0.9) {
    pace.op(current);
  }

  if (Math.random() < 0.05 && total <= 50000) {
    total += Math.floor(Math.random() * 100);
    pace.total = total;
  }

  // Cause some work to be done.
  for (var i = 0; i < 1000000; i++) {
    current = current;
  }
}
