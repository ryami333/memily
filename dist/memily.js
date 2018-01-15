"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mem;
exports.flush = flush;
// Global store of all the memoization caches, so that they can all be flushed at once without re-initing all the memoized functions.
var storeCache = new Map();

function mem(fn, options) {
  if (!storeCache.has(fn)) {
    storeCache.set(fn, new Map());
  }

  var cacheKey = options && options.cacheKey;
  var maxAge = options && options.maxAge;

  function memoizedFn() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args && args.length > 1) {
      throw new Error('Cannot memoize functions with multiple arguments');
    }

    var store = storeCache.get(fn);
    var key = cacheKey ? cacheKey.apply(void 0, args) : arguments[0];

    if (typeof key !== 'string' && typeof key !== 'number' && typeof key !== 'undefined') {
      throw new Error('cacheKey must return a string or integer');
    }

    if (store && store.has(key)) {
      var result = store.get(key);

      if (result) {
        var elapsed = Date.now() - result.time;

        if (!maxAge || elapsed < maxAge) {
          return result.value;
        }
      }
    }

    var value = fn.apply(void 0, args);

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