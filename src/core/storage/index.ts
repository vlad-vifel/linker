import { androidAdapter } from './android';
import { IS_NATIVE } from './const';
import { localServerAdapter } from './localServer';

export const storage = IS_NATIVE ? androidAdapter : localServerAdapter;
export { Native } from './native';
export * from './const';
export * from './types';
export * from './utils';
