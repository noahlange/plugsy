import { Serializable } from '../decorators/persist';
import { persisted, toPersist } from '../utils/constants';
export default class Plugsy {
    [toPersist]: string[];
    [persisted]: Record<string, Serializable>;
    help(): string;
    /**
     * Plugin teardown.
     */
    uninstall(): Promise<void> | void;
    /**
     * Adds persistence to declared variables.
     */
    install(): Promise<void> | void;
}
