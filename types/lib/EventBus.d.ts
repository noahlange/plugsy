import { Handler } from '../decorators/command';
export default class EventBus {
    protected _events: Record<string, Array<(...args: any[]) => any> | null>;
    on(event: string, callback: (...args: any[]) => any): number;
    off(event: string, callback: number | Handler): void;
    dispatch(event: string, ...args: any[]): void;
}
