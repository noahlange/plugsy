import Plugsy from '../lib/Plugsy';

function brand(object) {
  Object.defineProperty(object, '$$command$$', { value: true });
}

// overloading is stupid
function command(target: Plugsy | Function, key?: string, descriptor?: PropertyDescriptor): any {  
  // Property branding - we'd use Symbols if they were consistently available.
  // But they're not, so we won't.
  let fn = typeof target === 'function';
  fn ? brand(target) : brand(target[key]);
  return fn ? target : descriptor;
}

export default command;