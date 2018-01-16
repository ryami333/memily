// @flow

type Options<Args> = {|
    cacheKey?: (...Args) => string | number,
    maxAge?: number,
|};

type Result = { time: number, value: any };
type Store = Map<string | number, Result>;
type StoreCache = Map<Function, Store>;

// Global store of all the memoization caches, so that they can all be flushed at once without re-initing all the memoized functions.
const storeCache: StoreCache = new Map();

export default function mem<FnArgs: Array<*>, FnReturn>(
    fn: (...args: FnArgs) => FnReturn,
    options?: Options<FnArgs>,
): (...FnArgs) => FnReturn {
    if (!storeCache.has(fn)) {
        storeCache.set(fn, new Map());
    }

    const cacheKey = options && options.cacheKey;
    const maxAge = options && options.maxAge;

    function memoizedFn(...args: FnArgs): FnReturn {
        if (args && args.length > 1) {
            throw new Error('Cannot memoize functions with multiple arguments');
        }
        const store = storeCache.get(fn);

        // eslint-disable-next-line prefer-rest-params
        const key = cacheKey ? cacheKey(...args) : arguments[0];

        if (
            typeof key !== 'string' &&
            typeof key !== 'number' &&
            typeof key !== 'undefined'
        ) {
            throw new Error('cacheKey must return a string or integer');
        }

        if (store && store.has(key)) {
            const result = store.get(key);

            if (result) {
                const elapsed = Date.now() - result.time;

                if (!maxAge || elapsed < maxAge) {
                    return result.value;
                }
            }
        }

        const value = fn(...args);

        if (store) {
            store.set(key, {
                time: Date.now(),
                value,
            });
        }

        return value;
    }

    return memoizedFn;
}

export function flush() {
    Array.from(storeCache.keys()).forEach(key => {
        storeCache.set(key, new Map());
    });
}
