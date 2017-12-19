export default function shimmer(obj: any, methods: object) {
  for (const key in methods) {
    if (methods[key]) {
      const callback = methods[key];
      const old = obj[key];
      // replace old function with new function
      obj[key] = function(...args) {
        // need to bind it so it can be called directly in the replacement fn.
        return callback.call(this, old ? old.bind(this) : old, ...args);
      };
    }
  }
}
