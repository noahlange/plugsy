import test from 'ava';
import redef, { dedef } from '../utils/redef';

test('should properly redef/dedef functions', t => {
  const foo = {
    bar(one: number, two: number) {
      return one + two;
    }
  };
  const exts = {
    bar: (_, fn, one, two) => {
      return fn(one, two) + two + one;
    }
  };

  const exts2 = {
    bar: (_, fn, one, two) => {
      return fn(one, two) * one * two;
    }
  };

  // no shimming
  t.is(foo.bar(1, 2), 3);

  // shim one, invoke base
  const id1 = redef(foo, exts);
  t.is(foo.bar(1, 2), 6);

  // shim two, invoking one and then base
  const id2 = redef(foo, exts2);
  t.is(foo.bar(1, 2), 12);

  // remove shim one, now two invokes base
  dedef(foo, id1);
  t.is(foo.bar(1, 2), 6);

  // remove shim two, invoke base
  redef(foo, id2);
  t.is(foo.bar(1, 2), 3);
});
