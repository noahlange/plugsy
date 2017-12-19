import test from 'ava';
import shimmer from '../utils/shimmer';

test('shimmer should shim a method and pass the current method as a bound first arg', t => {

  class Foo {
    public cats = 'bar';
    public foo() {
      return this.cats;
    }
  }

  class MyClass extends Foo {
  }

  shimmer(MyClass.prototype, {
    foo(orig) {
      const bar = orig.call(this);
      return `foo${bar}`;
    }
  });

  const c = new MyClass();
  t.is(c.foo(), 'foobar');
});
