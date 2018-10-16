export default function serialize<T, K extends keyof T>(obj: T): Partial<Record<K, T[K]>>;
