import { defineStore } from 'pinia';
import { computed } from 'vue';
import {
    DEFAULT_NO_TAG_LABEL,
    deleteTag,
    deleteUntagged,
    NO_TAG,
    renameTag,
    type StoreFile,
} from '@/core/format';
import type { TagOption } from '@/types/tags';
import { useVaultStore } from './vault';

export const useTagsStore = defineStore('tags', () => {
    const vault = useVaultStore();

    const usage = computed(() => {
        const counts = new Map<string, number>();
        for (const entry of vault.data?.links ?? []) {
            for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
        return counts;
    });

    const options = computed<TagOption[]>(() =>
        Object.entries(vault.data?.tags ?? {})
            .map(([key, meta]) => ({ key, label: meta.label, count: usage.value.get(key) ?? 0 }))
            .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
    );

    const keys = computed(() => Object.keys(vault.data?.tags ?? {}));
    const noTagLabel = computed(() => vault.data?.noTagLabel || DEFAULT_NO_TAG_LABEL);
    const noTagCount = computed(
        () => (vault.data?.links ?? []).filter((entry) => !entry.tags.length).length,
    );

    function sortByUsage(list: string[]) {
        const count = (key: string) => usage.value.get(key) ?? 0;
        return [...list].sort((a, b) => count(b) - count(a) || a.localeCompare(b));
    }

    function text(key: string) {
        if (key === NO_TAG) return noTagLabel.value;
        return vault.data?.tags[key]?.label || key;
    }

    function apply(change: (store: StoreFile) => StoreFile) {
        vault.commit((store) => Object.assign(store, change(store)));
    }

    function add(key: string, label: string | null = null) {
        apply((store) => ({ ...store, tags: { ...store.tags, [key]: { label } } }));
    }

    function setLabel(key: string, label: string | null) {
        add(key, label);
    }

    function rename(from: string, to: string) {
        apply((store) => renameTag(store, from, to));
    }

    function remove(key: string, withEntries: boolean) {
        apply((store) => deleteTag(store, key, withEntries));
    }

    function removeUntagged() {
        apply(deleteUntagged);
    }

    function setNoTagLabel(label: string | null) {
        apply((store) => ({ ...store, noTagLabel: label }));
    }

    return {
        usage,
        options,
        keys,
        noTagLabel,
        noTagCount,
        text,
        sortByUsage,
        add,
        setLabel,
        rename,
        remove,
        removeUntagged,
        setNoTagLabel,
    };
});
