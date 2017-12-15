// load a file from the data directory by this name...
export default function load(name) {
  return new Promise((resolve, reject) => {
    // fetch would probably work fine, but eh...
    const xhr = new XMLHttpRequest();
    const url = 'data/' + name;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
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
