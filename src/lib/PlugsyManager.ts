import Plugsy from '..';

import { hasWindow, isCommand } from '../utils/constants';
import hydrate from '../utils/hydrate';
import persist from '../utils/serialize';
import shim from '../utils/shimmer';
import parse from '../utils/tagger';

const hasCorescript: boolean = hasWindow && (window as any).corescript;
const corescript = hasCorescript ? (window as any).corescript : null;

export default class PlugsyManager {
  // hash of name => plugin instance
  public plugins: Record<string, Plugsy> = {};
  public toInstall: Plugsy[] = [];

  // hash of id => notetags => props
  public notetags: Record<string, Array<Record<string, string>>> = {};

  // additional data files to load.
  public data = [];

  // hash of name => serialized contents
  public store: Record<string, any> = {};

  // overwrite save and load functionality.
  public constructor() {
    const Data = hasCorescript ? corescript.Managers.DataManager : DataManager;

    shim(Data, {
      // on game load...
      extractSaveContents: (dm, extractSave, contents) => {
        extractSave(contents);
        this.load(contents.plugsy);
      },
      // load notetags
      isDatabaseLoaded: async (dm, isLoaded) => {
        const okay = isLoaded();
        const reduce = async (p, curr) => {
          const prev = await p;
          return {
            ...prev,
            [curr.id]: await parse(curr.note)
          };
        };

        this.notetags = await (hasCorescript
          ? Object.keys(corescript.$)
              .filter(f => Array.isArray(corescript.$[f]))
              .reduce(async (p, f) => {
                const a = await p;
                return {
                  ...a,
                  [f]: await (corescript.$[f] || [])
                    .filter(i => i && i.note)
                    .reduce(reduce, {})
                };
              }, {})
          : Object.keys(window)
              .filter(k => k.startsWith('$'))
              .filter(k => Array.isArray(window[k]))
              .reduce(async (p, k) => {
                const a = await p;
                return {
                  ...a,
                  [k]: await (window[k] || [])
                    .filter(i => i && i.note)
                    .reduce(reduce, {})
                };
              }, {}));

        for (const plugin of this.toInstall) {
          this._install(plugin);
        }

        return okay;
      },
      loadDatabase: (dm, load) => {
        dm._databaseFiles.push(...this.data);
        load();
      },
      makeSaveContents: (dm, makeSave) => {
        const contents = makeSave();
        contents.plugsy = this.save();
        return contents;
      }
    });
  }

  // returns the plugin's own properties for serialization.
  // this is not a great solution, but it'll work for now.
  public save(): object {
    const out = {};
    for (const name in this.plugins) {
      if (this.plugins[name]) {
        const plugin = this.plugins[name];
        out[name] = persist(plugin);
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

  // hydrate a plugin with its serialized contents
  public hydrate(plugin: Plugsy): void {
    hydrate(plugin, this.store[plugin.constructor.name] || {});
  }

  // retrieve a plugin by name or constructor
  public get<T extends Plugsy>(name: string | typeof Plugsy): T {
    const normalized = typeof name === 'function' ? name.name : name;
    return this.plugins[normalized] as T;
  }

  // install a plugin by constructor and register commands.
  /// can be chained -- $plugsy.install(new Foo).install(new Bar);
  public install<T extends Plugsy>(plugin: T): this {
    this.toInstall.push(plugin);
    this.data.push(...plugin.data);
    return this;
  }

  protected _install(plugin: Plugsy) {
    plugin.init();
    const Interpreter = hasCorescript
      ? corescript.Game.Game_Interpreter
      : Game_Interpreter;
    const name = plugin.constructor.name;
    this.hydrate(plugin);
    plugin.parameters = PluginManager.parameters(name);
    this.plugins[name] = plugin;
    shim(Interpreter.prototype, {
      pluginCommand(
        interpreter,
        fn: (...args: any[]) => any,
        command: string,
        args: string[]
      ) {
        fn(command, args);
        const subcommand = args[0];
        if (command.toLowerCase() === name.toLowerCase()) {
          const cmd = plugin[subcommand];
          if (cmd && cmd[isCommand]) {
            cmd.apply(plugin, args.slice(1));
          }
        }
      }
    });
  }
}
