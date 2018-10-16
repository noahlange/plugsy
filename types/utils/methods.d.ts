import Plugsy from '../lib/Plugsy';
import { PlugsyConstructor } from '../lib/PlugsyManager';
/**
 * Based on electrum-utils' implementation.
 * https://github.com/epsitec-sa/electrum-utils/blob/master/src/get-instance-method-names.js
 */
export default function getInstanceMethodNames<S extends Plugsy, T extends S>(obj: T, stop: PlugsyConstructor<S>): Array<keyof T>;
