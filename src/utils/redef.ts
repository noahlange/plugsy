import { isRedefined } from './constants';

let handle = 1;

/**
 * Reverse the redefinition of `target` with handle `n`.
 */
export function dedef<T>(target: T, n: number): void {
  for (const key in target) {
    if (target[key] && target[key][isRedefined]) {
      delete target[key][isRedefined][n];
    }
  }
}

/**
 * Redefine the methods of `target` with a hash of keys to replacement methods.
 * Passing in the returned handle will reverse the operation.
 */
export default function redef<T extends object>(target: T, index: number): void;
export default function redef<T extends object, K extends keyof T>(
  target: T,
  methods: BoundMethodRecord<T, K>
): number;
export default function redef<T extends object, K extends keyof T>(
  target: T,
  methods: BoundMethodRecord<T, K> | number
): number | T {
  if (typeof methods === 'number') {
    dedef(target, methods);
    return;
  } else {
    for (const key in methods) {
      if (key in methods) {
        redefine(target, key, methods[key]);
      }
    }
    return handle++;
  }
}

type PartialRecord<T extends string | number | symbol, U> = Partial<
  Record<T, U>
>;

type BoundMethodRecord<T, K extends keyof T> = PartialRecord<
  K,
  Bound<T, T[K]>
> &
  PartialRecord<string, Bound<T, any>>;

type Fn<T> = T extends (...args: infer U) => infer R
  ? (...args: U) => R
  : (...args: any[]) => any;

type Bound<O, F> = F extends (...args: infer U) => infer R
  ? (obj: O, fn: F, ...args: U) => R
  : (obj: O, fn: F, ...args: any[]) => any;

const wrapFn = <T>(key: string) => {
  const wrap = (ctx: T, curr: any, prev: any) => {
    // this is the function we're handing to the user
    return (...args: any[]) => curr(ctx, prev, ...args);
  };
  return function redefined(...args: any[]) {
    const all = this[key][isRedefined];
    const fns: Array<Bound<T, any>> = Object.keys(all).map(k =>
      all[k].bind(this)
    );
    let res: any = fns.shift();
    while (fns.length) {
      const curr = fns.shift();
      const prev = res;
      res = (...moreArgs: any[]) => wrap(this, curr, prev)(...moreArgs);
    }
    return res(...args);
  };
};

export function redefine<
  T,
  K extends keyof T,
  P extends T[K] & Fn<T[K]>,
  V extends Bound<T, T[K]>
>(object: T, key: any, fn: V) {
  const original = object[key] as P;
  let redefs: Record<number, Bound<T, any>> = {};
  // i.e., adding new method
  if (!original) {
    redefs = { 0: fn };
  } else {
    const id = handle;
    redefs = original[isRedefined] ? original[isRedefined] : { 0: original };
    redefs[id] = (obj: T, prev: Fn<T>, ...args: any[]) => {
      return prev ? fn.call(obj, obj, prev, ...args) : fn.apply(obj, args);
    };
  }
  // tslint:disable-next-line
  return Object.assign(object, {
    // tslint:disable-next-line
    [key]: Object.assign(wrapFn(key), {
      [isRedefined]: redefs
    })
  });
}
