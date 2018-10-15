// load a file from the data directory by this name...
export default function load<T = any>(name: string): Promise<T> {
  const url = 'data/' + (name.endsWith('.json') ? name : name + '.json');
  return fetch(url).then(res => res.json());
}
