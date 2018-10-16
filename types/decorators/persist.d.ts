import Plugsy from '..';
export declare function brand(object: any): Object;
export declare type Serializable = string | number | boolean | IJSONObject | IJSONArray;
interface IJSONObject {
    [x: string]: Serializable;
}
interface IJSONArray extends Array<Serializable> {
}
declare function persist(value: Serializable): any;
declare function persist(value: Plugsy, key: string): any;
export default persist;
