// @flow

import consecutive from 'consecutive';
import memily, { flush } from './memily';

describe('memily', () => {
    it('succesfully caches results of function calls', async () => {
        const memoized = memily(consecutive());

        expect(memoized()).toEqual(0);
        expect(memoized()).toEqual(0);
    });

    it('only calls the the root function on the first call', () => {
        const fn = jest.fn();
        const memoized = memily(fn, { cacheKey: () => 'key', maxAge: 200 });

        expect(fn.mock.calls.length).toEqual(0);
        memoized();
        expect(fn.mock.calls.length).toEqual(1);
        memoized();
        expect(fn.mock.calls.length).toEqual(1);
    });

    it('expires results after maxAge', async () => {
        const memoized = memily(consecutive(), {
            maxAge: 100,
        });

        expect(memoized()).toEqual(0);
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(memoized()).toEqual(1);
    });

    it('caches forever if maxAge not passed', async () => {
        const memoized = memily(consecutive());

        expect(memoized()).toEqual(0);
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(memoized()).toEqual(0);
    });

    it('Caches by the argument passed to the memoized function', async () => {
        const memoized = memily(consecutive());

        expect(memoized('foo')).toEqual(0);
        expect(memoized('foo')).toEqual(0);
        expect(memoized('bar')).toEqual(1);
        expect(memoized('bar')).toEqual(1);
    });

    it('Caches by the argument passed to the memoized function using the cacheKey callback', async () => {
        const memoized = memily(consecutive(), {
            cacheKey: (args: Object) => (args.cacheByThis: string),
        });

        expect(memoized({ cacheByThis: 'foo', notThis: 'baz' })).toEqual(0);
        expect(memoized({ cacheByThis: 'foo', notThis: 'qux' })).toEqual(0);
        expect(memoized({ cacheByThis: 'bar', notThis: 'baz' })).toEqual(1);
        expect(memoized({ cacheByThis: 'bar', notThis: 'qux' })).toEqual(1);
    });

    it('throws an error when you try to invoke a memoized function with mulitple arguments', async () => {
        const memoized = memily(jest.fn());
        expect(() => memoized('foo', 'bar')).toThrow();
    });

    it('throws an error when cacheKey returns anything but a string|number', async () => {
        // $FlowFixMe
        const memoized = memily(jest.fn(), {
            cacheKey: () => ({ foo: 'bar' }),
        });
        expect(() => memoized()).toThrow();
    });

    it('flushes the cache when "flush" invoked', async () => {
        const memoized = memily(consecutive());

        expect(memoized()).toEqual(0);
        flush();
        expect(memoized()).toEqual(1);
    });

    it('works with promises', async () => {
        const next = consecutive();
        const memoized = memily(() => Promise.resolve(next()));

        expect(await memoized()).toEqual(0);
        expect(await memoized()).toEqual(0);
    });

    it('preserves flow type of source function', () => {
        {
            const add = (arg1: number, arg2: number) => arg1 + arg2;
            const memoizedAdd = memily(add);

            memoizedAdd(1, 2);
            // $FlowFixMe
            memoizedAdd('a', 2);
        }

        {
            const add = ({ arg1, arg2 }: { arg1: number, arg2: number }) =>
                arg1 + arg2;
            const memoizedAdd = memily(add);

            memoizedAdd({ arg1: 1, arg2: 2 });
            // $FlowFixMe
            memoizedAdd({ arg1: 'a', arg2: 2 });
        }
    });
});
