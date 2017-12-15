function getTagProps(props: string) {
  let out = {};
  for (const prop of props.trim().split(' ')) {
    const [ key, value = true ] = prop.split('=');
    out[key] = value === true ? value : value.replace(/"/g, '');
  }
  return out;
}

function parseTags(str: string, regex: RegExp, ) {
  let next;
  let arr = [];
  let out = {};
  while (next = regex.exec(str)) {
    if (next) arr.push(next);
  }
  for (const match of arr) {
    const [ input, tag, props, content ] = match;
    out[tag] = props && getTagProps(props) || {};
    if (content) {
      out[tag].contents = content.replace(/"/g, '');
    }
  }
  return out;
}

export default function tagger(note: string): object {
  if (typeof note !== 'string') return;
  let out = {};
  const full = /<([a-zA-Z0-9]+)\ ?([a-zA-Z].+[=".+"]?[\s?]*)?>([a-zA-Z\s]+)?<\/([a-zA-Z0-9]+)>/g;
  const half = /<([a-zA-Z0-9]+)\ ?([a-zA-Z].+[=".+"]?)?\s?\/>/g;
  const oldFull = /<([a-zA-Z0-9]+)\ ?([a-zA-Z].+[=".+"][\s?]*)?>([a-zA-Z\s]+)?<\/([a-zA-Z0-9]+)>/g;
  const oldHalf = /<([a-zA-Z0-9]+)\ ?([a-zA-Z].+[=".+"])?\s?\/>/g;
  Object.assign(out, parseTags(note, full));
  Object.assign(out, parseTags(note, half));
  return out;
}