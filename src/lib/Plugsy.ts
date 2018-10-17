import command from '../decorators/command';
import { Serializable } from '../decorators/persist';
import { snakecase } from '../utils/casings';
import {
  description,
  isCommand,
  persisted,
  toPersist
} from '../utils/constants';
import getInstanceMethodNames from '../utils/methods';
import parameters from '../utils/signature';

function isBooleanOrNull(value: any): value is boolean | null {
  return value === true || value === false || value === null;
}

export default class Plugsy {
  // do *not* initialize or it'll overwrite the array of decorated persists
  public [toPersist]: string[];
  // hash of persisted values
  public [persisted]: Record<string, Serializable> = {};

  // with decorator metadata / fn serialization, return list of plugin commands
  @command('Returns information about this plugin.')
  public help() {
    const commands = [];
    for (const key of getInstanceMethodNames(this, Plugsy)) {
      if (this[key] && this[key][isCommand]) {
        const info = { command: key, description: this[key][description] };
        const desc = info.description ? `\n- ${info.description}` : '';
        const sig = parameters(this, key.toString());
        const plugin = snakecase(this.constructor.name);
        commands.push(`## ${plugin} ${snakecase(info.command)}${sig}${desc}`);
      }
    }
    return `# ${this.constructor.name}\n${commands.join('\n')}`;
  }

  /**
   * Plugin teardown.
   */
  public uninstall(): Promise<void> | void {
    return;
  }

  /**
   * Adds persistence to declared variables.
   */
  public install(): Promise<void> | void {
    const keys = this[toPersist] || [];
    for (const key in this) {
      if (keys.indexOf(key) === -1 && key !== toPersist) {
        const value = this[key] as any;
        if (value !== null && value[toPersist]) {
          if (keys.indexOf(key) === -1) {
            keys.push(key);
          }
          this[persisted][key] = value[persisted] ? value[persisted] : value;
          Object.defineProperty(this, key, {
            get: () => this[persisted][key],
            set: v => (this[persisted][key] = v)
          });
        }
      }
    }
    this[toPersist] = keys;
  }
}
