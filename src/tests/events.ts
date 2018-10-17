import test from 'ava';
import on from '../decorators/on';
import EventBus from '../lib/EventBus';
import Plugsy from '../lib/Plugsy';
import { handlerFor } from '../utils/constants';

test('should register and dispatch events', t => {
  const eb = new EventBus();
  let n = 0;
  eb.on('event', () => n++);
  eb.on('event', () => n++);
  eb.dispatch('event');
  t.is(n, 2);
});

test('should unregister events by handle', t => {
  const eb = new EventBus();
  let n = 0;
  const i = eb.on('event', v => n += v);
  eb.dispatch('event', 2);
  eb.off('event', i);
  eb.dispatch('event', 1);
  t.is(n, 2);
});

test('should unregister events by reference', t => {
  const eb = new EventBus();
  const cb = () => n++;
  let n = 0;
  eb.on('event', cb);
  eb.dispatch('event');
  eb.off('event', cb);
  eb.dispatch('event');
  t.is(n, 1);
});

test('should decorate standalone functions', t => {
  const fn = on('event', () => null);
  t.is(fn[handlerFor], 'event');
  t.is(fn(), null);
});

test('should decorate class methods', t => {
  class Foo extends Plugsy {
    @on('event')
    public fn() {
      return null;
    }
  }
  const foo = new Foo();
  t.is(foo.fn[handlerFor], 'event');
  t.is(foo.fn(), null);
});
