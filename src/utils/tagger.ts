import { Parser } from 'tsxml';

// https://stackoverflow.com/a/15829686
function camelcase(str: string) {
  return str.replace(
    /^([A-Z])|[\s-_]+(\w)/g,
    (match, p1, p2) => (p2 ? p2.toUpperCase() : p1.toLowerCase())
  );
}

function parseAst(node: any, out: any = {}) {
  if (!node) {
    return;
  }

  if (node.content) {
    return node.content;
  }

  if (node.attrList) {
    for (const attr in node.attrList) {
      if (attr in node.attrList) {
        const cased = camelcase(attr);
        const v = node.attrList[attr];
        out[cased] = v === undefined ? true : v;
      }
    }
  }

  if (node.childNodes) {
    const children = node.childNodes.map(n => parseAst(n));
    if (children.length > 1) {
      out.children = children;
    }
    if (children.length === 1 && typeof children[0] === 'string') {
      out.contents = children[0];
    }
    // out = children.reduce((a, b) => ({ ...a, ...b }), out);
  }

  if (node.tagName) {
    return {
      [node.tagName]: out
    };
  }

  return out;
}

export default async function tagger(note: string): Promise<object | null> {
  if (typeof note !== 'string') {
    return null;
  }
  const ast = await Parser.parseStringToAst(note);
  let out = ast.childNodes.map(child => parseAst(child));
  out = out.reduce((a, b) => ({ ...a, ...b }), {});
  return out;
}
