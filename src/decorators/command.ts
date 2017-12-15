import Plugsy from '../lib/Plugsy';

function brand(object) {
  Object.defineProperty(object, '$$command$$', { value: true });
}

// overloading is stupid
function command(
  target: Plugsy<any> | ((...args: any[]) => any),
  key?: string,
  descriptor?: PropertyDescriptor
): any {
  // Property branding - we'd use Symbols if they were consistently available.
  // But they're not, so we won't.
  const fn = typeof target === 'function';
  fn ? brand(target) : brand(target[key]);
  return fn ? target : descriptor;
}

export default command;
