import command from './decorators/command';
import Plugsy from './lib/Plugsy';
import PlugsyManager from './lib/PlugsyManager';
import loader from './utils/loader';
import shimmer from './utils/shimmer';
import tagger from './utils/tagger';

// only in browser environments...
if (window) {
  if (!(window as any).$plugsy) {
    (window as any).$plugsy = new PlugsyManager();
  } else {
    // someone bundled it directly into their plugin.
    console.warn('Multiple copies of Plugsy loaded.');
  }
}

export { command, loader, tagger, shimmer };
export default Plugsy;
