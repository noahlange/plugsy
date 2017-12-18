import Plugsy from './Plugsy';

import merge from '../utils/merge';
import shim from '../utils/shimmer';
import parse from '../utils/tagger';

declare var DataManager;
declare var Game_Interpreter;
declare var PluginManager;

export default class PlugsyManager {
  // hash of name => plugin instance
  public plugins: {
    [key: string]: Plugsy<any>;
  } = {};

  // hash of id => notetags => props
  public notetags = {};

  // additional data files to load.
  public data = [];

  // hash of name => serialized contents
  public store = {};

  // returns the plugin's own properties for serialization.
  // this is not a great solution but it'll work for now.
  public save(): object {
    const out = {};
    for (const name in this.plugins) {
      if (this.plugins[name]) {
        const plugin = this.plugins[name];
        out[name] = {};
        Object.getOwnPropertyNames(plugin)
          .filter(prop => typeof plugin[prop] !== 'function')
          .forEach(prop => (out[name][prop] = plugin[prop]));
      }
    }
    return out;
  }

  // load data from the save file into the data store.
  public load(contents: object): void {
    for (const name in contents) {
      if (contents[name]) {
        this.store[name] = contents[name];
      }
    }
  }

  // hydrate a plugin with its prior contents
  public hydrate(plugin: Plugsy<any>): void {
    merge(plugin, this.store[plugin.constructor.name]);
  }

  // retrieve a plugin by name or constructor
  public get<T extends Plugsy<any>>(name: string | typeof Plugsy): T {
    const normalized = typeof name === 'function' ? name.name : name;
    return this.plugins[normalized] as T;
  }

  // install a plugin by constructor and register commands.
  /// can be chained -- $plugsy.install(new Foo).install(new Bar);
  public install<T extends Plugsy<any>>(plugin: T): this {
    const { name, data = [] } = plugin.constructor as any;
    this.hydrate(plugin);
    plugin.parameters = PluginManager.parameters(name);
    this.plugins[name] = plugin;
    this.data.push(...data);
    shim(Game_Interpreter.prototype, {
      pluginCommand(fn: (...args: any[]) => any, command: string, args: string[]) {
        fn(command, args);
        const subcommand = args[0];
        if (command.toLowerCase() === name.toLowerCase()) {
          const cmd = plugin[subcommand];
          if (cmd && cmd.$$command$$) {
            cmd.apply(plugin, args.slice(1));
          }
        }
      }
    });
    return this;
  }

  // overwrite save and load functionality.
  public constructor() {
    shim(DataManager, {
      // on game load...
      extractSaveContents: (extractSave, contents) => {
        extractSave(contents);
        this.load(contents.plugsy);
      },
      // load notetags
      isDatabaseLoaded: isLoaded => {
        const okay = isLoaded();
        const all = {};
        Object.keys(window || {})
          // eek
          .filter(f => f[0] === '$')
          .filter(f => Array.isArray(window[f]))
          .forEach(f => {
            const notetags = {};
            const items = window[f];
            for (const item of items) {
              if (item.note) {
                Object.assign(notetags, { [item.id]: parse(item.note) });
              }
            }
            all[f] = notetags;
          });
        this.notetags = all;
        return okay;
      },
      loadDatabase: load => {
        DataManager._databaseFiles.push(...this.data);
        load();
      },
      makeSaveContents: makeSave => {
        const contents = makeSave();
        contents.plugsy = this.save();
        return contents;
      }
    });
  }
}
