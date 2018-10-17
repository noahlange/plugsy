import Plugsy from '..';
import EventBus from './EventBus';
export interface PlugsyConstructor<T extends Plugsy> {
    new (...args: any[]): T;
}
export default class PlugsyManager extends EventBus {
    /**
     * Array of registered plugin constructors.
     */
    ctors: Record<string, any>;
    /**
     * Hash of name => plugin instance
     */
    plugins: Record<string, Plugsy>;
    notetags: Record<string, Array<Record<string, any>>>;
    store: Record<string, any>;
    protected _commands: Record<string, Record<string, (...args: any[]) => any>>;
    constructor();
    /**
     * An alphabetically-sorted list of all registered plugin commands.
     */
    readonly commands: string[];
    /**
     * Overload save/load/plugin command functionality.
     */
    extend(): void;
    /**
     * Register a plugin constructor for installation. Can be chained,
     * e.g., $plugsy.install(Foo).install(Bar);
     */
    install<T extends Plugsy>(plugin: PlugsyConstructor<T>): this;
    protected _save(): object;
    protected _load(contents: object): void;
    protected _uninstallPlugins(): Promise<void>;
    protected _hydrate(name: string, plugin: Plugsy): void;
    protected _installPlugins(): Promise<void>;
    protected _uninstall(name: string): Promise<void>;
    protected _install(plugin: Plugsy): Promise<void>;
}
