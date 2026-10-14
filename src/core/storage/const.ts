import { Capacitor } from '@capacitor/core';
import type { StorageErrorCode } from './types';

export const STORAGE_ERROR_MESSAGES: Record<StorageErrorCode, string> = {
    NOT_FOUND: 'File not found',
    NO_ACCESS: 'No access to the file',
    NO_DIR: 'Folder does not exist',
    EXISTS: 'File already exists',
    BAD_EXTENSION: 'File must end with .linker.json',
    NO_SERVER: 'Local server is not running',
    NO_PICKER: 'File picker is not available, type the path',
    BAD_LOCATION: 'Pick a file from the device storage',
    IO_ERROR: 'Could not read or write the file',
};

export const IS_NATIVE = Capacitor.isNativePlatform();
export const NATIVE_ROOT = '/storage/emulated/0';
export const DOWNLOADS_DIR = `${NATIVE_ROOT}/Download`;
export const BACKUP_DIR = 'linker-backups';
