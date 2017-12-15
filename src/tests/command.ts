import test from 'ava';
import Plugsy from '../lib/Plugsy';
import command from '../decorators/command';

test('should brand functions when called as a function', t => {
  const out = command(() => true);
  t.is(out['$$command$$'], true);
});

test('should brand properties when called as a decorator', t => {
  class MyClass extends Plugsy {
    @command
    public foo() {
      return null;
    }
  }
  const out = new MyClass();
  t.is(out.foo['$$command$$'], true);
});