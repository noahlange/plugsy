function isObject(o) {
  return o
    && typeof o !== 'function'
    && Object.keys(o)
    && !Array.isArray(o);
}

export default function merge(target, data: object = {}) {
  for (const key in data) {
    if (data[key]) {
      const val = data[key];
      const obj = target[key];
      if (isObject(obj)) {
        merge(obj, val);
      } else {
        this[key] = val;
      }
    }
  }
  return target;
}
