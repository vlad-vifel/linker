import { BACKUP_DIR, NATIVE_ROOT, STORAGE_ERROR_MESSAGES } from './const';
import type { StorageErrorCode } from './types';

export class StorageError extends Error {
    code: StorageErrorCode;

    constructor(code: StorageErrorCode) {
        super(STORAGE_ERROR_MESSAGES[code] ?? STORAGE_ERROR_MESSAGES.IO_ERROR);
        this.code = code;
    }
}

export function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
}

export function localDate(date = new Date()) {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localStamp(date = new Date()) {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${localDate(date)}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
}

export function displayStamp(stamp: string) {
    const [day, time] = stamp.split('_');
    const [year, month, date] = day.split('-');
    const text = `${date}.${month}.${year}`;
    return time ? `${text} ${time.replace('-', ':')}` : text;
}

export function backupFileName(path: string, extension: string, stamp: string) {
    return `${backupPrefix(path, extension)}${stamp}${extension}`;
}

export function slugify(name: string) {
    return (
        name
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, '-')
            .replace(/^-+|-+$/g, '') || 'linker'
    );
}

export function joinPath(dir: string, name: string) {
    const separator = dir.includes('\\') ? '\\' : '/';
    return `${dir.replace(/[\\/]+$/, '')}${separator}${name}`;
}

export function dirname(path: string) {
    return path.replace(/[\\/][^\\/]*$/, '');
}

export function basename(path: string) {
    return path.split(/[\\/]/).pop() ?? path;
}

export function resolveFilePath(input: string, name: string, extension: string) {
    const path = input.trim();
    if (path.toLowerCase().endsWith(extension)) return path;
    return joinPath(path, `${slugify(name)}${extension}`);
}

export function displayPath(path: string) {
    return path.startsWith(`${NATIVE_ROOT}/`) ? path.slice(NATIVE_ROOT.length + 1) : path;
}

export function backupDir(path: string) {
    return joinPath(dirname(path), BACKUP_DIR);
}

export function backupPrefix(path: string, extension: string) {
    return `${basename(path).slice(0, -extension.length)}-`;
}

export function samePath(a: string, b: string) {
    const normalize = (path: string) => path.replace(/\\/g, '/').toLowerCase();
    return normalize(a) === normalize(b);
}
