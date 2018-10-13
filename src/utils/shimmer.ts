import { shimmedFn } from './constants';

let shimId = 1;

function shimmer<T>(obj: T, index: number): T;
function shimmer<T, K extends keyof T>(
  obj: T,
  methods: BoundMethodRecord<T, K>
): number;
function shimmer<T, K extends keyof T>(
  obj: T,
  methods: BoundMethodRecord<T, K> | number
): number | T {
  if (typeof methods === 'number') {
    for (const key in obj) {
      if (obj[key] && obj[key][shimmedFn]) {
       delete obj[key][shimmedFn][methods];
      }
    }
  } else {
    for (const key in methods) {
      if (key in methods) {
        obj = shim(obj, key, methods[key]);
      }
    }
  }
  return shimId++;
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

export function unshim(fn, index) {
  fn[shimmedFn].splice(index, 1);
}

export function shim<
  T,
  K extends keyof T,
  P extends T[K] & Fn<T[K]>,
  V extends Bound<T, T[K]>
>(object: T, key: any, fn: V) {

  const original = object[key] as P;
  const id = shimId;

  const shims: Record<number, Bound<T, any>> = original[shimmedFn]
    ? original[shimmedFn]
    : { 0: original };

  shims[id] = (obj: T, prev: Fn<T>, ...args: any[]) => {
    return prev
      ? fn.call(obj, obj, prev, ...args)
      : fn.apply(obj, args);
  }

  const wrap = (ctx: T, curr: any, prev: any) => {
    // this is the function we're handing to the user
    return (...args: any[]) => curr(ctx, prev, ...args);
  }

  const newfn = function(...args: any[]) {
    const all = this[key][shimmedFn];
    const fns: Array<Bound<T, any>> = Object.keys(all).map(k => all[k].bind(this));
    let res: any = fns.shift();

    while (fns.length) {
      const curr = fns.shift();
      const prev = res;
      res = (...moreArgs: any[]) => wrap(this, curr, prev)(...moreArgs);
    }

    return res(...args);
  }

  // tslint:disable-next-line
  return Object.assign(object, {
    // tslint:disable-next-line
    [key]: Object.assign(newfn, {
      [shimmedFn]: shims
    })
  });
}

export default shimmer;