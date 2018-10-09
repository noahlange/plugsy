import test from 'ava';
import p from '../utils/tagger';

test('parse double note-tags with contents', async t => {
  t.deepEqual(await p(`<NoteTag>these are my contents</NoteTag>`), {
    NoteTag: { contents: 'these are my contents' }
  });
});

test('parse double note-tags sans contents', async t => {
  t.deepEqual(await p('<NoteTag></NoteTag>'), { NoteTag: {} });
});

test('should parse empty attributes as true', async t => {
  t.deepEqual(await p('<NoteTag foo></NoteTag>'), { NoteTag: { foo: true } });
});

test('parse double note-tags with props and contents', async t => {
  t.deepEqual(await p('<NoteTag one="two">vegan</NoteTag>'), {
    NoteTag: { contents: 'vegan', one: 'two' }
  });
});

test('parse double note-tags with multiple props and contents', async t => {
  t.deepEqual(await p('<NoteTag one="two" three="four">vegan</NoteTag>'), {
    NoteTag: { one: 'two', three: 'four', contents: 'vegan' }
  });
});

test('parse single note-tags with props', async t => {
  t.deepEqual(await p(`<NoteTag foo="bar" baz="bat" />`), {
    NoteTag: { baz: 'bat', foo: 'bar' }
  });
});

test('should parse empty attributes as true', async t => {
  t.deepEqual(await p('<NoteTag foo />'), { NoteTag: { foo: true } });
});

test('parse single note-tags sans props', async t => {
  t.deepEqual(await p('<NoteTag />'), { NoteTag: {} });
});

test('should parse multiple full note tags', async t => {
  const str = `
    <NoteTag1 baz="bat"></NoteTag1>
    <NoteTag2>foobar</NoteTag2>
  `;
  t.deepEqual(await p(str), {
    NoteTag1: { baz: 'bat' },
    NoteTag2: { contents: 'foobar' }
  });
});

test('should parse multiple half note tags', async t => {
  const str = `
    <NoteTag1 baz="bat" />
    <NoteTag2 />
  `;
  t.deepEqual(await p(str), { NoteTag1: { baz: 'bat' }, NoteTag2: {} });
});

test('should parse a mix of full and half note tags', async t => {
  const str = `
    <NoteTag1 baz="bat" />
    <NoteTag2>SAD FACE</NoteTag2>
  `;
  t.deepEqual(await p(str), {
    NoteTag1: { baz: 'bat' },
    NoteTag2: { contents: 'SAD FACE' }
  });
});

test('should parse kebab-cased attributes into camel-cased ones', async t => {
  const str = `<NoteTag data-bar="asdf"></NoteTag>`;
  t.deepEqual(await p(str), {
    NoteTag: { dataBar: 'asdf' }
  });
});

test("shouldn't explode when it can't find note tags", async t => {
  t.notThrows(() => p(''));
  t.notThrows(() => p(undefined));
  t.notThrows(() => p(null));
});
