// load a file from the data directory by this name...
export default function load<T = any>(name: string): Promise<T> {
  return new Promise((resolve, reject) => {
    // fetch would probably work fine, but you never know.
    const xhr = new XMLHttpRequest();
    // automatically add an extension if it isn't passed.
    const url = 'data/' + name.endsWith('.json') ? name : name + '.json';
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = () => {
      if (xhr.status < 400) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = reject;
    xhr.send();
  });
}
