import { NO_TAG, TAG_KEY_PATTERN, TAG_KEY_REQUIRED_CHAR } from './const';
import type { Entry, StoreFile } from './types';

export function normalizeTagKey(raw: string) {
    return raw.trim().replace(/^#+/, '').toLowerCase();
}

export function tagKeyError(key: string, existing: string[] = []) {
    if (!key) return 'Tag is empty';
    if (!TAG_KEY_PATTERN.test(key)) return 'Only letters, digits and _';
    if (!TAG_KEY_REQUIRED_CHAR.test(key)) return 'Needs at least one letter or digit';
    if (existing.includes(key)) return 'Tag already exists';
    return null;
}

export function ensureTags(tags: StoreFile['tags'], keys: string[]) {
    for (const key of keys) if (key !== NO_TAG) tags[key] ??= { label: null };
    return tags;
}

export function tagsFromEntries(entries: Entry[], existing: StoreFile['tags'] = {}) {
    const tags = { ...existing };
    for (const entry of entries) ensureTags(tags, entry.tags);
    return tags;
}

export function withoutTag(tags: StoreFile['tags'], key: string) {
    return Object.fromEntries(Object.entries(tags).filter(([tag]) => tag !== key));
}
