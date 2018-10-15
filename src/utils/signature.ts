// https://stackoverflow.com/a/9924463
const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/gm;
const ARGUMENT_NAMES = /([^\s,]+)/g;

/**
 * Returns an array of parameter names.
 */
function getParamNames(fn: (...args: any[]) => any): string[] {
  const fnStr = fn.toString().replace(STRIP_COMMENTS, '');
  const result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(ARGUMENT_NAMES);
  return result === null ? [] : result;
}

/**
 * Returns an array of parameter types.
 */
function getParamTypes(object: object, key: string): string[] {
  const args = Reflect.getMetadata('design:paramtypes', object, key) || [];
  return args.map(
    arg => (arg === 'undefined' ? 'void' : arg.name.toLowerCase())
  );
}

/**
 * Returns the return type of a function.
 */
function getReturnType(object: object, key: string): string {
  const type = Reflect.getMetadata('design:returntype', object, key);
  return type && type !== 'undefined' ? `${type.name}` : 'void';
}

export default function parameters(object: object, key: string) {
  const fn = object[key];
  const names = getParamNames(fn);
  const types = getParamTypes(object, key);
  const rtype = getReturnType(object, key);
  const toMarkdown = (name, i) => `${name}${types[i] ? `: *${types[i]}*` : ''}`;
  return `(${names.map(toMarkdown).join(', ')})${rtype ? `: *${rtype}*` : ''}`;
}
