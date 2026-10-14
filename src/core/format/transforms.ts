import { cleanPresets, presetError, tagsFromPresets } from './presets';
import { NO_TAG } from './const';
import { nowIso, uniqueIds } from './store';
import { tagsFromEntries, withoutTag } from './tags';
import type { Entry, Preset, StoreFile } from './types';
import { urlKey } from './url';

function mergePresets(target: Preset[], source: Preset[]) {
    const result = [...target];
    const ids = new Set(target.map((preset) => preset.id));
    for (const preset of source) {
        if (presetError(preset, result)) continue;
        result.push(ids.has(preset.id) ? { ...preset, id: crypto.randomUUID() } : preset);
    }
    return result;
}

function mergeKey(entry: Entry) {
    return entry.url ? `url:${urlKey(entry.url)}` : `id:${entry.id}`;
}

export function mergeStores(target: StoreFile, source: StoreFile) {
    const byKey = new Map(target.links.map((entry) => [mergeKey(entry), entry]));
    let added = 0;
    let replaced = 0;
    let skipped = 0;
    for (const entry of source.links) {
        const key = mergeKey(entry);
        const current = byKey.get(key);
        if (current && entry.updatedAt <= current.updatedAt) {
            skipped++;
            continue;
        }
        if (current) replaced++;
        else added++;
        byKey.set(key, entry);
    }
    const links = uniqueIds([...byKey.values()]);
    const presets = mergePresets(target.presets, source.presets);
    const tags = tagsFromPresets(
        presets,
        tagsFromEntries(links, { ...source.tags, ...target.tags }),
    );
    for (const [key, meta] of Object.entries(source.tags)) {
        if (!tags[key].label && meta.label) tags[key] = { label: meta.label };
    }
    return { store: { ...target, tags, links, presets }, added, replaced, skipped };
}

export function renameTag(store: StoreFile, from: string, to: string, now = nowIso()): StoreFile {
    if (from === to) return store;
    const source = store.tags[from] ?? { label: null };
    const target = store.tags[to];
    const tags = withoutTag(store.tags, from);
    tags[to] = target?.label ? target : source;
    const links = store.links.map((entry) =>
        entry.tags.includes(from)
            ? {
                  ...entry,
                  tags: [...new Set(entry.tags.map((tag) => (tag === from ? to : tag)))],
                  updatedAt: now,
              }
            : entry,
    );
    const presets = cleanPresets(
        store.presets.map((preset) => ({
            ...preset,
            tags: preset.tags.map((tag) => (tag === from ? to : tag)),
        })),
    );
    return { ...store, tags, links, presets };
}

export function deleteTag(
    store: StoreFile,
    key: string,
    withEntries: boolean,
    now = nowIso(),
): StoreFile {
    const links = withEntries
        ? store.links.filter((entry) => !entry.tags.includes(key))
        : store.links.map((entry) =>
              entry.tags.includes(key)
                  ? { ...entry, tags: entry.tags.filter((tag) => tag !== key), updatedAt: now }
                  : entry,
          );
    const presets = cleanPresets(
        store.presets.map((preset) => ({
            ...preset,
            tags: preset.tags.filter((tag) => tag !== key),
        })),
    );
    return { ...store, tags: withoutTag(store.tags, key), links, presets };
}

export function deleteUntagged(store: StoreFile): StoreFile {
    return {
        ...store,
        links: store.links.filter((entry) => entry.tags.length > 0),
        presets: cleanPresets(
            store.presets.map((preset) => ({
                ...preset,
                tags: preset.tags.filter((tag) => tag !== NO_TAG),
            })),
        ),
        noTagLabel: null,
    };
}
