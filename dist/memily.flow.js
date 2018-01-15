// @flow

declare export default function<FnArgs: Array<any>, FnReturn>(fn: (...args: FnArgs) => FnReturn, options?: $Exact<{cacheKey?: <FnArgs>(..._: Args) => string | number, maxAge?: number}>): (..._: FnArgs) => FnReturn;

declare export function flush(): void;

