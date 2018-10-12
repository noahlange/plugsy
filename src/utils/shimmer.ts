export default function shimmer<T, K extends keyof T>(
  obj: T,
  methods: BoundMethodRecord<T, K>
) {
  for (const key in methods) {
    if (key in methods) {
      obj = shim(obj, key, methods[key]);
    }
  }
  return obj;
}

type BoundMethodRecord<T, K extends keyof T> =
  & Record<K, Bound<T, T[K]>>
  & Record<string, Bound<T, any>>;

type Fn<T> = T extends (...args: infer U) => infer R
  ? (...args: U) => R
  : (...args: any[]) => any;

type Bound<O, F> = F extends (...args: infer U) => infer R
  ? (obj: O, fn: F, ...args: U) => R
  : (obj: O, fn: F, ...args: any[]) => any;

export function shim<
  T,
  K extends keyof T,
  P extends T[K] & Fn<T[K]>,
  V extends Bound<T, T[K]>
>(object: T, key: any, fn: V) {
  const old = object[key] as P;

  const newfn = function(...args) {
    return fn.call(this, this, old ? old.bind(this) : old, ...args);
  } as V;

  // tslint:disable-next-line
  return Object.assign(object, {
    [key]: newfn
  });
}
