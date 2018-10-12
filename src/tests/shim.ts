import test from 'ava';
import shim from '../utils/shimmer';

test('should properly shim function', t => {
  const foo = {
    bar(one: number, two: number) {
      return one + two;
    }
  };

  const baz = shim(foo, {
    bar: (_, fn, one, two) => fn(one, two) + two + one,
  });

  t.is(baz.bar(1, 2), 6);
});
