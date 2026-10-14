import type { Entry, Preset } from './types';

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringList(value: unknown) {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isEntry(value: unknown): value is Entry {
    if (!isObject(value)) return false;
    const { id, url, note, tags, favorite, createdAt, updatedAt } = value;
    return (
        typeof id === 'string' &&
        (url === null || typeof url === 'string') &&
        (note === null || typeof note === 'string') &&
        isStringList(tags) &&
        typeof favorite === 'boolean' &&
        typeof createdAt === 'string' &&
        typeof updatedAt === 'string'
    );
}

export function isPreset(value: unknown): value is Preset {
    if (!isObject(value)) return false;
    const { id, name, tags, favorite } = value;
    return (
        typeof id === 'string' &&
        (name === null || typeof name === 'string') &&
        isStringList(tags) &&
        typeof favorite === 'boolean'
    );
}
