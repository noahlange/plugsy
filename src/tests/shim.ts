import test from 'ava';
import shimmer from '../utils/shimmer';

test('should properly shim and unshim functions', t => {
  const foo = {
    bar(one: number, two: number) {
      return one + two;
    }
  };
  const shims = {
    bar: (_, fn, one, two) => {
      return fn(one, two) + two + one;
    }
  };

  const shims2 = {
    bar: (_, fn, one, two) => {
      return fn(one, two) * one * two;
    }
  };

  // no shimming
  t.is(foo.bar(1, 2), 3);

  // shim one
  const id1 = shimmer(foo, shims);
  // shim one invokes base fn
  t.is(foo.bar(1, 2), 6);

  // shim two, invoking one and then base
  const id2 = shimmer(foo, shims2);
  t.is(foo.bar(1, 2), 12);

  // remove shim one, now two invokes base
  shimmer(foo, id1);
  t.is(foo.bar(1, 2), 6);

  // remove shim two, invoking base
  shimmer(foo, id2);
  t.is(foo.bar(1, 2), 3);
});
