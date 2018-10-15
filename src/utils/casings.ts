// https://gist.github.com/youssman/745578062609e8acac9f#gistcomment-1973681
export function snakecase(str) {
  return str
    .replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
    .replace(/([A-Z])/g, ([letter]) => `_${letter.toLowerCase()}`)
}

// https://stackoverflow.com/a/15829686
export function camelcase(str: string) {
  return str.replace(
    /^([A-Z])|[\s-_]+(\w)/g,
    (_, p1, p2) => (p2 ? p2.toUpperCase() : p1.toLowerCase())
  );
}