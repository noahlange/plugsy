import test from 'ava';
import command from '../decorators/command';
import Plugsy from '../lib/Plugsy';

test('should brand functions when called as a function', t => {
  const out = command(() => true);
  t.is(out.$$command$$, true);
});

test('should brand properties when called as a decorator', t => {
  class MyClass extends Plugsy<any> {
    @command
    public foo() {
      return null;
    }
  }
  const out = new MyClass();
  t.is((out.foo as any).$$command$$, true);
});
