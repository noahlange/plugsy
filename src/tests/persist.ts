import test from 'ava';
import Plugsy, { persist } from '..';

import hydrate from '../utils/hydrate';
import serialize from '../utils/serialize';

class MyPlugin extends Plugsy {
  public myString = persist('foobar');
  @persist public myVariable = 42;
  @persist
  public myOtherVariable = {
    OH_HI: ['MARK', 'LISA']
  };
}

test('should predictably serialize objects', t => {
  const obj1 = new MyPlugin();
  obj1.init();
  obj1.myString = 'barfaz';
  t.deepEqual(serialize(obj1), {
    myOtherVariable: {
      OH_HI: ['MARK', 'LISA']
    },
    myString: 'barfaz',
    myVariable: 42
  });
});

test('should predictably hydrate objects', t => {
  const obj1 = new MyPlugin();
  const obj2 = new MyPlugin();
  obj1.init();
  obj2.init();
  const serialized = serialize(obj1);
  hydrate(obj2, serialized);
  t.deepEqual(obj1, obj2);
});
