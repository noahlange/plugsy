import { Serializable } from '../decorators/persist';
import { persisted, toPersist } from '../utils/constants';

abstract class Plugsy {
  // do *not* initialize or it'll overwrite the array of decorated persists
  public [toPersist]: string[];
  // hash of persisted values
  public [persisted]: Record<string, Serializable> = {};
  public data?: string[] = [];
  public parameters?: any;

  public init() {
    const keys = this[toPersist] || [];

    for (const key in this) {
      if (key in this) {
        const value = this[key];
        if (value && value[toPersist]) {
          if (keys.indexOf(key) === -1) {
            keys.push(key);
          }
        }
      }
    }

    for (const key of keys) {
      const value = this[key];
      this[persisted][key] = value[persisted] ? value[persisted] : value;
      Object.defineProperty(this, key, {
        get: () => this[persisted][key],
        set: v => (this[persisted][key] = v)
      });
    }
    this[toPersist] = keys;
  }
}

export default Plugsy;
