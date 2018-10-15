import test from 'ava';
import Plugsy from '..';
import command from '../decorators/command';
import { isCommand } from '../utils/constants';

class MyPlugin extends Plugsy {

  @command('This is a function.')
  public fn(a: string, b: number, c: object): number {
    return b;
  }

  @command
  public fn2(a: string, b: number, c: object) {
    return;
  }
}

test('should describe plugins', t => {
  const p = new MyPlugin();
  const res = p.help();
  t.truthy(res);
})

test('should brand functions when called as a function', t => {
  const out = command(() => true);
  t.is(out[isCommand], true);
});

test('should brand properties when called as a decorator', t => {
  const out = new MyPlugin();
  t.is(out.fn2[isCommand], true);
});
