export default function shimmer(obj: any, methods: object) {
  for (const key in methods) {
    let callback = methods[key];
    // need to bind it so it can be called directly in the replacement fn.
    let old = obj[key].bind(obj);
    // replace old function with new function
    obj[key] = function(...args) {
      return callback.apply(this, [old, ...args]);
    };
  }
}
