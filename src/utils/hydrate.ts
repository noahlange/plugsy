import persist from './persist';

export default function merge<T, K extends string & keyof T>(
  target: T,
  persisted: Partial<Record<K, T[K]>>
): T {
  for (const key of Object.keys(persisted)) {
    target[key] = persisted[key];
  }
  return target;
}
