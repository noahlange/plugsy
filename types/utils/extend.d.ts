import { isExtended } from './constants';
declare function extender<T>(obj: T, index: number): T;
declare function extender<T, K extends keyof T>(obj: T, methods: BoundMethodRecord<T, K>): number;
declare type PartialRecord<T extends string | number | symbol, U> = Partial<Record<T, U>>;
declare type BoundMethodRecord<T, K extends keyof T> = PartialRecord<K, Bound<T, T[K]>> & PartialRecord<string, Bound<T, any>>;
declare type Fn<T> = T extends (...args: infer U) => infer R ? (...args: U) => R : (...args: any[]) => any;
declare type Bound<O, F> = F extends (...args: infer U) => infer R ? (obj: O, fn: F, ...args: U) => R : (obj: O, fn: F, ...args: any[]) => any;
export declare function unextend(fn: any, index: any): void;
export declare function extend<T, K extends keyof T, P extends T[K] & Fn<T[K]>, V extends Bound<T, T[K]>>(object: T, key: any, fn: V): T & {
    [x: number]: ((...args: any[]) => any) & {
        [isExtended]: Record<number, ((obj: T, fn: any, ...args: unknown[]) => {}) | ((obj: T, fn: any, ...args: any[]) => any)>;
    };
};
export default extender;
