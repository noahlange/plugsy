import 'reflect-metadata';

import { hasWindow } from './utils/constants';

import command from './decorators/command';
import on from './decorators/on';
import persist from './decorators/persist';

import Plugsy from './lib/Plugsy';
import PlugsyManager from './lib/PlugsyManager';

import loader from './utils/loader';
import redef, { dedef } from './utils/redef';
import tagger from './utils/tagger';

declare global {
  interface Window {
    $plugsy: PlugsyManager;
  }
}

// only in browser-like environments (i.e., not while testing in node)
if (hasWindow) {
  const w = window as any;
  // if corescript is loaded, hook into that.
  if (w.corescript) {
    w.corescript.$.plugsy = new PlugsyManager();
  } else {
    // otherwise put it on the window.
    w.$plugsy = new PlugsyManager();
  }
}

export default Plugsy;
export { PlugsyManager, command, on, persist, loader, tagger, redef, dedef };
