// @flow

type Options = {|
    cacheKey?: any => string | number,
    maxAge?: number,
|};

type Result = { time: number, value: any };
type Store = Map<string | number, Result>;
type StoreCache = Map<Function, Store>;

// Global store of all the memoization caches, so that they can all be flushed at once without re-initing all the memoized functions.
const storeCache: StoreCache = new Map();

export default function memily<Fn: Function>(
    fn: Fn,
    { cacheKey, maxAge }: Options = {},
): Fn {
    if (!storeCache.has(fn)) {
        storeCache.set(fn, new Map());
    }

    function memoizedFn(args: any, ...rest: Array<any>): $Call<Fn> {
        if (rest.length > 0) {
            throw new Error('Cannot memoize functions with multiple arguments');
        }
        const store = storeCache.get(fn);

        const key = cacheKey ? cacheKey(args) : args;

        if (store && store.has(key)) {
            const result = store.get(key);

            if (result) {
                const elapsed = Date.now() - result.time;

                if (!maxAge || elapsed < maxAge) {
                    return result.value;
                }
            }
        }

        const value = fn(args);

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
