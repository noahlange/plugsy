export default function shimmer(obj: any, methods: object) {
  for (const key in methods) {
    if (methods[key]) {
      const callback = methods[key];
      // need to bind it so it can be called directly in the replacement fn.
      const old = obj[key].bind(obj);
      // replace old function with new function
      obj[key] = function(...args) {
        return callback.apply(this, [old, ...args]);
      };
    }
  }
}
