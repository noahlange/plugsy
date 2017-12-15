import test from 'ava';
import shimmer from '../utils/shimmer';

test('shimmer should shim a method and pass the current method as a bound first arg', t => {
  class MyClass {
    foo() {
      return 'bar';
    }
  }

  shimmer(MyClass.prototype, {
    foo(orig) {
      return `foo${orig()}`;
    }
  });

  const c = new MyClass();
  t.is(c.foo(), 'foobar');
});
