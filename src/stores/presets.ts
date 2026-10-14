import { defineStore } from 'pinia';
import { computed } from 'vue';
import { ensureTags, type Preset, type PresetDraft, presetError } from '@/core/format';
import { useVaultStore } from './vault';

export const usePresetsStore = defineStore('presets', () => {
    const vault = useVaultStore();

    const presets = computed(() => vault.data?.presets ?? []);
    const byId = computed(() => new Map(presets.value.map((preset) => [preset.id, preset])));

    function error(draft: PresetDraft, exceptId?: string) {
        return presetError(draft, presets.value, exceptId);
    }

    function normalize(draft: PresetDraft): PresetDraft {
        return { ...draft, name: draft.name?.trim() || null };
    }

    function add(draft: PresetDraft) {
        if (error(draft)) return null;
        const preset: Preset = { ...normalize(draft), id: crypto.randomUUID() };
        vault.commit((store) => {
            ensureTags(store.tags, preset.tags);
            store.presets = [...store.presets, preset];
        });
        return preset;
    }

    function update(id: string, draft: PresetDraft) {
        if (error(draft, id)) return false;
        const next = normalize(draft);
        vault.commit((store) => {
            ensureTags(store.tags, next.tags);
            store.presets = store.presets.map((preset) =>
                preset.id === id ? { ...preset, ...next } : preset,
            );
        });
        return true;
    }

    function remove(id: string) {
        vault.commit((store) => {
            store.presets = store.presets.filter((preset) => preset.id !== id);
        });
    }

    function reorder(ids: string[]) {
        vault.commit((store) => {
            const byKey = new Map(store.presets.map((preset) => [preset.id, preset]));
            const ordered = ids.flatMap((id) => byKey.get(id) ?? []);
            if (ordered.length === store.presets.length) store.presets = ordered;
        });
    }

    return { presets, byId, error, add, update, remove, reorder };
});
