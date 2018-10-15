import Plugsy from '..';
import { description as desc, isCommand } from '../utils/constants';

export interface PropertyOrMethodDecorator extends MethodDecorator, PropertyDecorator {
  (target: object, propertyKey: string): void;
}

type Handler = (...args: any[]) => any;

function brand(object: any, description: string) {
  Object.defineProperty(object, isCommand, { value: true });
  Object.defineProperty(object, desc, { value: description });
}

function decorateProperty(target: Handler, description?: string) {
  brand(target, description);
  return target;
}

function decorateMethod<T extends Plugsy>(
  target: T,
  key: string,
  description: string
) {
  brand(target[key], description);
  return;
}

function decorate(target: Plugsy, key: string, description?: string): void;
function decorate(target: Handler): Handler;
function decorate(
  target: Plugsy | Handler,
  key?: string,
  description?: string
): Handler | void {
  if (typeof target === 'function') {
    return decorateProperty(target, description);
  } else {
    return decorateMethod(target, key, description);
  }
}

function wrapper(description: string): PropertyOrMethodDecorator {
  return (target: any, key?: string) => decorate(target, key, description);
}

function command(target: string): PropertyOrMethodDecorator;
function command(target: Plugsy, key: string): void;
function command(target: Handler, key?: string): Handler;
function command(
  target: Plugsy | Handler | string,
  key?: string,
  description?: string
): PropertyOrMethodDecorator {
  if (typeof target === 'string') {
    return wrapper(target);
  } else {
    if (typeof target === 'function') {
      return decorate(target as any, key, description) as any;
    } else {
      decorate(target, key);
    }
  }
}

export default command;
