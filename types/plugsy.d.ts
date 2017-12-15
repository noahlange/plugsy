declare module 'plugsy' {
  export function command(
    target: Plugsy | Function,
    key?: string,
    descriptor?: PropertyDescriptor
  ): any;
  export function shimmer(obj: any, methods: object): void;
  export function tagger(note: string): object;
  export function load(name: string): Promise<any>;
  export default Plugsy;
}

declare class Plugsy {
  public commands: object;
}

interface ICtor<T> {
  new (): T;
}

declare class PlugsyManager {
  public plugins: { [key: string]: Plugsy };
  public notetags: { [key: string]: { [key: string]: object } };
  public get<T extends Plugsy>(name: string | ICtor<T>): T;
  public install<T extends Plugsy>(plugin: T): this;
  public save(): object;
  public load(contents: object): void;
  protected hydrate(plugin: Plugsy): void;
  public constructor();
}

declare var $plugsy: PlugsyManager;
