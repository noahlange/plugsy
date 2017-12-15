import Plugsy from './lib/Plugsy';
import PlugsyManager from './lib/PlugsyManager';
import command from './decorators/command';
import loader from './utils/loader';
import shimmer from './utils/shimmer';
import tagger from './utils/tagger';

// only in browser environments...
if (window) {
  if (!window.$plugsy) {
    window.$plugsy = new PlugsyManager();
  } else {
    // someone bundled it directly into their plugin.
    console.warn('Multiple copies of Plugsy loaded.');
  }
}

export default Plugsy;
export { command, loader, tagger, shimmer }; 