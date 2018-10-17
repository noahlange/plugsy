import Plugsy from '../lib/Plugsy';
import { handlerFor } from '../utils/constants';
import { Handler } from './command';

function brand(object: any, event: string) {
  Object.defineProperty(object, handlerFor, { value: event });
  return object;
}

function wrapper(handler: Handler, event: string): Handler {
  return brand(handler, event);
}

function on(event: string): MethodDecorator;
function on(event: string, handler: Handler): Handler;
function on(event: string, handler?: Handler): Handler | MethodDecorator {
  if (typeof handler === 'function') {
    return wrapper(handler, event);
  } else {
    return (target: Plugsy, key: string) => {
      wrapper(target[key], event);
      return target;
    };
  }
}

export default on;
