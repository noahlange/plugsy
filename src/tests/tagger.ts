import test from 'ava';
import p from '../utils/tagger';

test('parse double note-tags with contents', t => {
  t.deepEqual(p(`<NoteTag>these are my contents</NoteTag>`), {
    NoteTag: { contents: 'these are my contents' }
  });
});

test('parse double note-tags sans contents', t => {
  t.deepEqual(p('<NoteTag></NoteTag>'), { NoteTag: {} });
});

test('should parse empty attributes as true', t => {
  t.deepEqual(p('<NoteTag foo></NoteTag>'), { NoteTag: { foo: true }});
});

test('parse double note-tags with props and contents', t => {
  t.deepEqual(p('<NoteTag one="two">vegan</NoteTag>'), {
    NoteTag: { one: 'two', contents: 'vegan' }
  });
});

test('parse double note-tags with multiple props and contents', t => {
  t.deepEqual(p('<NoteTag one="two" three="four">vegan</NoteTag>'), {
    NoteTag: { one: 'two', three: 'four', contents: 'vegan' }
  });
});

test('parse single note-tags with props', t => {
  t.deepEqual(p(`<NoteTag foo="bar" baz="bat" />`), {
    NoteTag: { baz: 'bat', foo: 'bar' }
  });
});

test('should parse empty attributes as true', t => {
  t.deepEqual(p('<NoteTag foo />'), { NoteTag: { foo: true }});
});

test('parse single note-tags sans props', t => {
  t.deepEqual(p('<NoteTag />'), { NoteTag: {} });
});

test('should parse multiple full note tags', t => {
  const str = `
    <NoteTag1 baz="bat"></NoteTag1>
    <NoteTag2>foobar</NoteTag2>
  `;
  t.deepEqual(p(str), {
    NoteTag1: { baz: 'bat' },
    NoteTag2: { contents: 'foobar' }
  });
});

test('should parse multiple half note tags', t => {
  const str = `
    <NoteTag1 baz="bat" />
    <NoteTag2 />
  `;
  t.deepEqual(p(str), { NoteTag1: { baz: 'bat' }, NoteTag2: {} });
});

test('should parse a mix of full and half note tags', t => {
  const str = `
    <NoteTag1 baz="bat" />
    <NoteTag2>SAD FACE</NoteTag>
  `;
  t.deepEqual(p(str), {
    NoteTag1: { baz: 'bat' },
    NoteTag2: { contents: 'SAD FACE' }
  });
});

test('shouldn\'t explode when it can\'t find note tags', t => {
  t.notThrows(() => p(''));
  t.notThrows(() => p(undefined));
  t.notThrows(() => p(null));
});
