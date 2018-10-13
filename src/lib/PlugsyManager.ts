import Plugsy from '..';

import { hasWindow, isCommand } from '../utils/constants';
import hydrate from '../utils/hydrate';
import persist from '../utils/persist';
import shim from '../utils/shimmer';
import parse from '../utils/tagger';

const hasCorescript: boolean = hasWindow && (window as any).corescript;
const corescript = hasCorescript ? (window as any).corescript : null;

interface PlugsyConstructor<T extends Plugsy> {
  new (...args: any[]): T;
}

export default class PlugsyManager {
  public commands: string[] = [];
  // typeof Plugsy
  public ctors: Record<string, any> = {};
  // hash of name => plugin instance
  public plugins: Record<string, Plugsy> = {};
  // hash of name => shim handle
  public handles: Record<string, number> = {};

  // hash of id => notetags => props
  public notetags: Record<string, Array<Record<string, any>>> = {};

  // additional data files to load.
  public data = [];

  // hash of name => serialized contents
  public store: Record<string, any> = {};

  public constructor() {
    this.shim();
  }

  // overwrite save and load functionality.
  public shim() {
    const Data = hasCorescript ? corescript.Managers.DataManager : DataManager;

    shim(Data, {
      // on game load...
      extractSaveContents: async (dm, extractSave, contents) => {
        await this._uninstallPlugins();
        this.store = {};
        this._load(contents.plugsy);
        extractSave(contents);
        await this._installPlugins();
      },
      setupNewGame: async (dm, setup) => {
        this.store = {};
        await this._uninstallPlugins();
        this._load({});
        setup();
        await this._installPlugins();
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
        return okay;
      },
      loadDatabase: (dm, load) => {
        dm._databaseFiles.push(...this.data);
        load();
      },
      makeSaveContents: (dm, makeSave) => {
        const contents = makeSave();
        contents.plugsy = this._save();
        return contents;
      }
    });
  }

  // install a plugin by constructor and register commands.
  /// can be chained -- $plugsy.install(Foo).install(Bar);
  public install<T extends Plugsy>(plugin: PlugsyConstructor<T>): this {
    this.ctors[plugin.name] = plugin;
    return this;
  }


  // returns the plugin's own properties for serialization.
  // this is not a great solution, but it'll work for now.
  protected _save(): object {
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
  protected _load(contents: object): void {
    for (const name in contents) {
      if (contents[name]) {
        this.store[name] = contents[name];
      }
    }
  }

  protected async _uninstallPlugins() {
    for (const key of Object.keys(this.plugins)) {
      this.commands = this.commands.filter(command => !command.startsWith(key));
      await this._uninstall(key);
    }
  }

  // hydrate a plugin with its serialized contents
  protected _hydrate(name: string, plugin: Plugsy): void {
    hydrate(plugin, this.store[name] || {});
  }

  protected async _installPlugins() {
    for (const key of Object.keys(this.ctors)) {
      if (!this.plugins[key]) {
        const Ctor = this.ctors[key];
        const plugin = new Ctor();
        this.data.push(...plugin.data);
        await this._install(plugin);
        this.plugins[key] = plugin;
      }
    }
  }

  protected async _uninstall(name: string) {
    const plugin = this.plugins[name];
    await plugin.uninstall();
    const id = this.handles[name];
    const Interpreter = hasCorescript
      ? corescript.Game.Game_Interpreter
      : Game_Interpreter;
    shim(Interpreter, id);
    delete this.plugins[name];
  }

  protected async _install(plugin: Plugsy) {
    const name = plugin.constructor.name;
    this._hydrate(name, plugin);
    await plugin.install();
    plugin.parameters = PluginManager.parameters(name);
    this.plugins[name] = plugin;

    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(plugin)
    )) {
      if (plugin[key][isCommand]) {
        this.commands.push(`${name.toLowerCase()} ${key.toLowerCase()}`);
      }
    }

    const Interpreter = hasCorescript
      ? corescript.Game.Game_Interpreter
      : Game_Interpreter;

    const handle = shim(Interpreter.prototype, {
      pluginCommand(
        int,
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

    this.handles[name] = handle;
  }
}
