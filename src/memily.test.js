// @flow

import consecutive from 'consecutive';
import mem, { flush } from './mem';

describe('mem', () => {
    it('succesfully caches results of function calls', async () => {
        const memoized = mem(consecutive());

        expect(memoized()).toEqual(0);
        expect(memoized()).toEqual(0);
    });

    it('only calls the the root function on the first call', () => {
        const fn = jest.fn();
        const memoized = mem(fn, { cacheKey: () => 'key', maxAge: 200 });

        expect(fn.mock.calls.length).toEqual(0);
        memoized();
        expect(fn.mock.calls.length).toEqual(1);
        memoized();
        expect(fn.mock.calls.length).toEqual(1);
    });

    it('expires results after maxAge', async () => {
        const memoized = mem(consecutive(), {
            maxAge: 100,
        });

        expect(memoized()).toEqual(0);
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(memoized()).toEqual(1);
    });

    it('caches forever if maxAge not passed', async () => {
        const memoized = mem(consecutive());

        expect(memoized()).toEqual(0);
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(memoized()).toEqual(0);
    });

    it('Caches by the argument passed to the memoized function', async () => {
        const memoized = mem(consecutive());

        expect(memoized('foo')).toEqual(0);
        expect(memoized('foo')).toEqual(0);
        expect(memoized('bar')).toEqual(1);
        expect(memoized('bar')).toEqual(1);
    });

    it('Caches by the argument passed to the memoized function using the cacheKey callback', async () => {
        const memoized = mem(consecutive(), {
            cacheKey: (args: Object) => (args.cacheByThis: string),
        });

        expect(memoized({ cacheByThis: 'foo', notThis: 'baz' })).toEqual(0);
        expect(memoized({ cacheByThis: 'foo', notThis: 'qux' })).toEqual(0);
        expect(memoized({ cacheByThis: 'bar', notThis: 'baz' })).toEqual(1);
        expect(memoized({ cacheByThis: 'bar', notThis: 'qux' })).toEqual(1);
    });

    it('throws an error when you try to invoke a memoized function with mulitple arguments', async () => {
        const memoized = mem(jest.fn());
        expect(() => memoized('foo', 'bar')).toThrow();
    });

    it('flushes the cache when "flush" invoked', async () => {
        const memoized = mem(consecutive());

        expect(memoized()).toEqual(0);
        flush();
        expect(memoized()).toEqual(1);
    });

    it('works with promises', async () => {
        const next = consecutive();
        const memoized = mem(() => Promise.resolve(next()));

        expect(await memoized()).toEqual(0);
        expect(await memoized()).toEqual(0);
    });
});
