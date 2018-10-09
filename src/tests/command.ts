import test from 'ava';
import Plugsy from '..';
import command from '../decorators/command';
import { isCommand } from '../utils/constants';

test('should brand functions when called as a function', t => {
  const out = command(() => true);
  t.is(out[isCommand], true);
});

test('should brand properties when called as a decorator', t => {
  class MyClass extends Plugsy {
    @command
    public foo() {
      return true;
    }
  }
  const out = new MyClass();
  t.is(out.foo[isCommand], true);
});
