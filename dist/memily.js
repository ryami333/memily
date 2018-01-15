"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mem;
exports.flush = flush;
// Global store of all the memoization caches, so that they can all be flushed at once without re-initing all the memoized functions.
var storeCache = new Map();

function mem(fn) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      cacheKey = _ref.cacheKey,
      maxAge = _ref.maxAge;

  if (!storeCache.has(fn)) {
    storeCache.set(fn, new Map());
  }

  function memoizedFn(args) {
    if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 0) {
      throw new Error('Cannot memoize functions with multiple arguments');
    }

    var store = storeCache.get(fn);
    var key = cacheKey ? cacheKey(args) : args;

    if (store && store.has(key)) {
      var result = store.get(key);

      if (result) {
        var elapsed = Date.now() - result.time;

        if (!maxAge || elapsed < maxAge) {
          return result.value;
        }
      }
    }

    var value = fn(args);

    if (store) {
      store.set(key, {
        time: Date.now(),
        value: value
      });
    }

    return value;
  }

  return memoizedFn;
}

function flush() {
  Array.from(storeCache.keys()).forEach(function (key) {
    storeCache.set(key, new Map());
  });
}