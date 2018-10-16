import { Handler } from './command';
declare function on(event: string): MethodDecorator;
declare function on(event: string, handler: Handler): Handler;
export default on;
