import Plugsy from '..';
import { persisted, toPersist } from '../utils/constants';

export function brand(object) {
  const o = new Object(object);
  if (object && !object[toPersist]) {
    Object.defineProperty(o, toPersist, { value: true });
    Object.defineProperty(o, persisted, { value: object });
  }
  return o;
}

export type Serializable = string | number | boolean | IJSONObject | IJSONArray;

interface IJSONObject {
  [x: string]: Serializable;
}

interface IJSONArray extends Array<Serializable> {}

function persist(value: Serializable);
function persist(value: Plugsy, key: string);
function persist(value: Plugsy | Serializable, key?: string) {
  if (!key) {
    return brand(value);
  } else {
    value[toPersist] = value[toPersist] ? value[toPersist].concat(key) : [key];
  }
}

export default persist;
