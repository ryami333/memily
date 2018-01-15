// @flow

declare export default function(fn: Function, _?: $Exact<{cacheKey?: (_: any) => string | number, maxAge?: number}>): (args: any, ...rest: Array<any>) => any;
declare export function flush(): void;

