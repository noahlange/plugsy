import parse from 'minimist-string';
import Plugsy from '..';

import { snakecase } from '../utils/casings';
import { hasWindow, isCommand } from '../utils/constants';
import hydrate from '../utils/hydrate';
import getInstanceMethodNames from '../utils/methods';
import persist from '../utils/persist';
import shim from '../utils/shimmer';
import tag from '../utils/tagger';

const hasCorescript: boolean = hasWindow && (window as any).corescript;
const corescript = hasCorescript ? (window as any).corescript : null;

export interface PlugsyConstructor<T extends Plugsy> {
  new (...args: any[]): T;
}

export default class PlugsyManager {
  /**
   * Array of registered plugin constructors.
   */
  public ctors: Record<string, any> = {};

  /**
   * Hash of name => plugin instance
   */
  public plugins: Record<string, Plugsy> = {};

  /*
   * hash of id => notetags => props
   */
  public notetags: Record<string, Array<Record<string, any>>> = {};

  // hash of name => serialized contents
  public store: Record<string, any> = {};

  protected _commands: Record<
    string,
    Record<string, (...args: any[]) => any>
  > = {};

  public constructor() {
    this.shim();
  }

  /**
   * An alphabetically-sorted list of all registered plugin commands.
   */
  public get commands(): string[] {
    return Object.keys(this._commands)
      .reduce(
        (a, b) =>
          a.concat(Object.keys(this._commands[b]).map(c => `${b} ${c}`)),
        []
      )
      .sort((a, b) => a.localeCompare(b));
  }

  /**
   * Overload save/load/plugin command functionality.
   */
  public shim() {
    const Data = hasCorescript ? corescript.Managers.DataManager : DataManager;
    const Interpreter = hasCorescript
      ? corescript.Game.Game_Interpreter
      : Game_Interpreter;

    shim(Interpreter.prototype, {
      pluginCommand: (
        _interpreter,
        pluginCommand: (...args: any[]) => any,
        command: string,
        ...originalArgs: string[]
      ) => {
        pluginCommand(command, originalArgs);
        const {
          _: [subcommand, ...args]
        } = parse(originalArgs.join(' '));
        let res = null;
        for (const fullCommand of this.commands) {
          // i.e., starts with plugin name
          if (fullCommand.startsWith(command + ' ' + subcommand)) {
            const fns = this._commands[command];
            if (fns && fns[subcommand]) {
              res = fns[subcommand](...args);
            }
          }
        }
        return res;
      }
    });

    shim(Data, {
      // on game load...
      extractSaveContents: async (dm, extractSave, contents) => {
        await this._uninstallPlugins();
        this._load(contents.plugsy);
        extractSave(contents);
        await this._installPlugins();
      },
      setupNewGame: async (dm, setup) => {
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
            [curr.id]: await tag(curr.note)
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
      makeSaveContents: (dm, makeSave) => {
        const contents = makeSave();
        contents.plugsy = this._save();
        return contents;
      }
    });
  }

  /**
   * Register a plugin constructor for installation. Can be chained,
   * e.g., $plugsy.install(Foo).install(Bar);
   */
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
      await this._uninstall(key);
    }
    this._commands = {};
    this.store = {};
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
        await this._install(plugin);
        this.plugins[key] = plugin;
      }
    }
  }

  protected async _uninstall(name: string) {
    const plugin = this.plugins[name];
    await plugin.uninstall();
    delete this.plugins[name];
  }

  protected async _install(plugin: Plugsy) {
    const name = plugin.constructor.name;
    this._hydrate(name, plugin);
    await plugin.install();
    this.plugins[name] = plugin;
    const commands = (this._commands[snakecase(name)] = {});
    for (const key of getInstanceMethodNames(plugin, Plugsy)) {
      const fn = plugin[key];
      if (fn[isCommand] && typeof fn === 'function') {
        commands[snakecase(key)] = fn.bind(plugin);
      }
    }
  }
}
