import { ensureTags } from './tags';
import type { Preset, PresetDraft, PresetError, StoreFile } from './types';

export function presetKey(preset: Pick<Preset, 'tags' | 'favorite'>) {
    return `${preset.favorite ? 1 : 0}|${[...preset.tags].sort().join(',')}`;
}

function nameKey(name: string | null) {
    return name?.trim().toLowerCase() || null;
}

export function presetError(
    draft: PresetDraft,
    presets: Preset[],
    exceptId?: string,
): PresetError | null {
    if (!draft.tags.length && !draft.favorite) return { kind: 'empty' };
    const others = presets.filter((preset) => preset.id !== exceptId);
    const key = presetKey(draft);
    const combo = others.find((preset) => presetKey(preset) === key);
    if (combo) return { kind: 'combo', existing: combo };
    const name = nameKey(draft.name);
    const named = name && others.find((preset) => nameKey(preset.name) === name);
    return named ? { kind: 'name', existing: named } : null;
}

export function cleanPresets(presets: Preset[]) {
    const seen = new Set<string>();
    const result: Preset[] = [];
    for (const preset of presets) {
        const tags = [...new Set(preset.tags)];
        const key = presetKey({ tags, favorite: preset.favorite });
        if ((!tags.length && !preset.favorite) || seen.has(key)) continue;
        seen.add(key);
        result.push({ ...preset, tags });
    }
    return result;
}

export function tagsFromPresets(presets: Preset[], existing: StoreFile['tags'] = {}) {
    const tags = { ...existing };
    for (const preset of presets) ensureTags(tags, preset.tags);
    return tags;
}
