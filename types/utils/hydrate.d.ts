export default function merge<T, K extends string & keyof T>(target: T, persisted: Partial<Record<K, T[K]>>): T;
