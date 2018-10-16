import { Parser } from 'tsxml';
import { camelcase } from './casings';

type ASTNode = any;
interface ReturnNode {
  [key: string]: string | ReturnNode | ReturnNode[];
  children?: ReturnNode[] | string;
  contents?: string;
}

/**
 * Parses a single AST node. Recursive
 */
function parseAst(node: ASTNode): ReturnNode {
  if (node) {
    const out: ReturnNode = {};
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
      const children: ReturnNode[] = node.childNodes.map(n => parseAst(n));
      if (children.length >= 1) {
        out.children = children;
      }
      // nodes with solo text nodes for children get a contents attribute
      // instead of children
      if (children.length === 1) {
        const first = children[0];
        if (typeof first === 'string') {
          out.contents = first;
          delete out.children;
        }
      }
    }

    if (node.tagName) {
      return {
        [node.tagName]: out
      };
    }
    return out;
  }
  return null;
}

/**
 * Given a string containing valid XML tags, returns a parsed tree of
 * tags and attributes.
 */
export default async function tagger(note: string): Promise<object | null> {
  if (typeof note !== 'string') {
    return null;
  }
  // filter out Yanfly-style tags
  const filtered = note
    .split('\n')
    .map(line => line.replace(/<(.*):[^/](.+)>/, ''))
    .join('\n');

  const ast = await Parser.parseStringToAst(filtered);
  return (
    ast.childNodes
      // clean-up
      .map(child => parseAst(child))
      // no loose text
      .filter(t => typeof t !== 'string')
      // concat top-level tags
      .reduce((a, b) => ({ ...a, ...b }), {})
  );
}
