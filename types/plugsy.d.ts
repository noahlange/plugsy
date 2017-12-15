declare module 'plugsy' {
  export function command(
    target: Plugsy<any> | Function,
    key?: string,
    descriptor?: PropertyDescriptor
  ): any;
  export function shimmer(obj: any, methods: object): void;
  export function tagger(note: string): object;
  export function loader(name: string): Promise<any>;
  export default Plugsy;
}

declare class Plugsy<T> {
  public commands: object;
  public parameters: T;
}

interface ICtor<T> {
  new (): T;
}

declare class PlugsyManager {
  public plugins: { [key: string]: Plugsy<any> };
  public notetags: { [key: string]: { [key: string]: object } };
  public get<T extends Plugsy<any>>(name: string | ICtor<T>): T;
  public install<T extends Plugsy<any>>(plugin: T): this;
  public save(): object;
  public load(contents: object): void;
  protected hydrate(plugin: Plugsy<any>): void;
  public constructor();
}

declare var $plugsy: PlugsyManager;
