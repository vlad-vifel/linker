import { FORMAT, FORMAT_VERSION } from './const';
import { isEntry, isObject, isPreset } from './guards';
import { cleanPresets, tagsFromPresets } from './presets';
import { tagsFromEntries } from './tags';
import type { Entry, StoreFile } from './types';

export class StoreFormatError extends Error {
    code: 'invalid' | 'newer-version';

    constructor(message: string, code: 'invalid' | 'newer-version') {
        super(message);
        this.code = code;
    }
}

export function nowIso() {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function createStore(name: string): StoreFile {
    return {
        format: FORMAT,
        version: FORMAT_VERSION,
        name,
        createdAt: nowIso(),
        tags: {},
        links: [],
        presets: [],
    };
}

export function isEntryValid(entry: Pick<Entry, 'url' | 'note'>) {
    return Boolean(entry.url?.trim() || entry.note?.trim());
}

function normalizeTags(value: Record<string, unknown>) {
    const tags: StoreFile['tags'] = {};
    for (const [key, meta] of Object.entries(value)) {
        const label = isObject(meta) && typeof meta.label === 'string' ? meta.label : null;
        tags[key] = { label };
    }
    return tags;
}

export function uniqueIds(entries: Entry[]) {
    const seen = new Set<string>();
    return entries.map((entry) => {
        let id = entry.id;
        for (let n = 2; seen.has(id); n++) id = `${entry.id}-dup${n}`;
        seen.add(id);
        return id === entry.id ? entry : { ...entry, id };
    });
}

export function parseStore(content: string): StoreFile {
    let data: unknown;
    try {
        data = JSON.parse(content);
    } catch {
        throw new StoreFormatError('File is not valid JSON', 'invalid');
    }
    if (!isObject(data) || data.format !== FORMAT || typeof data.version !== 'number') {
        throw new StoreFormatError('Not a Linker file', 'invalid');
    }
    if (data.version > FORMAT_VERSION) {
        throw new StoreFormatError(
            'File was saved by a newer app version. Update the app',
            'newer-version',
        );
    }
    if (!isObject(data.tags) || !Array.isArray(data.links) || !data.links.every(isEntry)) {
        throw new StoreFormatError('File structure is broken', 'invalid');
    }
    const links = uniqueIds(data.links as Entry[]);
    const presets = cleanPresets(Array.isArray(data.presets) ? data.presets.filter(isPreset) : []);
    const noTagLabel = typeof data.noTagLabel === 'string' ? data.noTagLabel : null;
    const store = {
        ...(data as StoreFile),
        name: typeof data.name === 'string' ? data.name : '',
        version: FORMAT_VERSION,
        tags: tagsFromPresets(presets, tagsFromEntries(links, normalizeTags(data.tags))),
        links,
        presets,
    };
    if (noTagLabel) store.noTagLabel = noTagLabel;
    else delete store.noTagLabel;
    return store;
}

export function serializeStore(store: StoreFile) {
    return `${JSON.stringify(store, null, 2)}\n`;
}
