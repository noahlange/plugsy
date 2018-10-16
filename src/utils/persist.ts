import { toPersist } from './constants';

export default function serialize<T, K extends keyof T>(
  obj: T
): Partial<Record<K, T[K]>> {
  const out = {};
  for (const key of obj[toPersist] || []) {
    out[key] = obj[key];
  }
  return out;
}
