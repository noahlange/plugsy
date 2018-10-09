import Plugsy from '..';
import { isCommand } from '../utils/constants';

function brand(object) {
  Object.defineProperty(object, isCommand, { value: true });
}

type Handler = (...args: any[]) => any;

function command(target: Handler): Handler;
function command(target: Plugsy, key: string): PropertyDescriptor;
function command(
  target: Plugsy | Handler,
  key?: string
): PropertyDescriptor | Handler {
  if (typeof target === 'function') {
    brand(target);
    return target;
  } else {
    brand(target[key]);
    return;
  }
}

export default command;
