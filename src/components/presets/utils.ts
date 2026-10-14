import type { Entry, PresetDraft } from '@/core/format';

export function draftFromEntry(entry: Pick<Entry, 'tags' | 'favorite'>): PresetDraft | null {
    if (!entry.tags.length && !entry.favorite) return null;
    return { name: null, tags: entry.tags, favorite: entry.favorite };
}
