import { isRedefined } from './constants';
/**
 * Reverse the redefinition of `target` with handle `n`.
 */
export declare function dedef<T>(target: T, n: number): void;
/**
 * Redefine the methods of `target` with a hash of keys to replacement methods.
 * Passing in the returned handle will reverse the operation.
 */
export default function redef<T extends object>(target: T, index: number): void;
export default function redef<T extends object, K extends keyof T>(target: T, methods: BoundMethodRecord<T, K>): number;
declare type PartialRecord<T extends string | number | symbol, U> = Partial<Record<T, U>>;
declare type BoundMethodRecord<T, K extends keyof T> = PartialRecord<K, Bound<T, T[K]>> & PartialRecord<string, Bound<T, any>>;
declare type Fn<T> = T extends (...args: infer U) => infer R ? (...args: U) => R : (...args: any[]) => any;
declare type Bound<O, F> = F extends (...args: infer U) => infer R ? (obj: O, fn: F, ...args: U) => R : (obj: O, fn: F, ...args: any[]) => any;
export declare function redefine<T, K extends keyof T, P extends T[K] & Fn<T[K]>, V extends Bound<T, T[K]>>(object: T, key: any, fn: V): T & {
    [x: number]: ((...args: any[]) => any) & {
        [isRedefined]: Record<number, ((obj: T, fn: any, ...args: unknown[]) => {}) | ((obj: T, fn: any, ...args: any[]) => any)>;
    };
};
export {};
