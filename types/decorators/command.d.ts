import Plugsy from '..';
export interface PropertyOrMethodDecorator extends MethodDecorator, PropertyDecorator {
    (target: object, propertyKey: string): void;
}
export declare type Handler = (...args: any[]) => any;
declare function command(target: string): PropertyOrMethodDecorator;
declare function command(target: Plugsy, key: string): void;
declare function command(target: Handler, key?: string): Handler;
export default command;
