import Plugsy from '../lib/Plugsy';
import { PlugsyConstructor } from '../lib/PlugsyManager';


/**
 * Based on electrum-utils' implementation.
 * https://github.com/epsitec-sa/electrum-utils/blob/master/src/get-instance-method-names.js
 */


function hasMethod<T extends Plugsy>(obj: T, name: keyof T): boolean {
  const desc = Object.getOwnPropertyDescriptor(obj, name);
  return !!desc && typeof desc.value === 'function';
}

export default function getInstanceMethodNames<S extends Plugsy, T extends S>(
  obj: T,
  stop: PlugsyConstructor<S>
): Array<keyof T> {
  const array = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto && proto !== stop) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name !== 'constructor') {
        if (hasMethod(proto, name)) {
          array.push(name);
        }
      }
    };
    proto = Object.getPrototypeOf(proto);
  }
  return array;
}
