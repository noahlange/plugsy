import 'reflect-metadata';
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
export default Plugsy;
export { PlugsyManager, command, on, persist, loader, tagger, redef, dedef };
