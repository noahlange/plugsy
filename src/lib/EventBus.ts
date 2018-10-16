import { Handler } from '../decorators/command';

export default class EventBus {
  // hash of event => callback handlers
  protected _events: Record<string, Array<(...args: any[]) => any> | null> = {};

  public on(event: string, callback: (...args: any[]) => any): number {
    if (event in this._events) {
      this._events[event].push(callback);
    } else {
      this._events[event] = [callback];
    }
    return this._events[event].length - 1;
  }

  public off(event: string, callback: number | Handler): void {
    const events = this._events[event];
    if (typeof callback === 'number') {
      events[callback] = null;
    } else {
      for (let i = 0; i < events.length; i++) {
        if (callback === events[i]) {
          events[i] = null;
        }
      }
    }
  }

  public dispatch(event: string, ...args: any[]) {
    if (event in this._events) {
      const fns = this._events[event];
      for (const fn of fns) {
        if (fn) {
          fn(...args);
        }
      }
    }
  }
}
