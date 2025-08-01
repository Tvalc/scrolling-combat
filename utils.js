// Utility functions, random, clamp, timing
window.Utils = {
  clamp: function(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },
  lerp: function(a, b, t) {
    return a + (b - a) * t;
  },
  randInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randFloat: function(min, max) {
    return Math.random() * (max - min) + min;
  },
  now: function() {
    return performance.now();
  },
  deepClone: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};