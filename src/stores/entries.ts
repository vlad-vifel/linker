import { defineStore } from 'pinia';
import { computed } from 'vue';
import { type Entry, type EntryDraft, ensureTags, nowIso, urlKey } from '@/core/format';
import { useVaultStore } from './vault';

export const useEntriesStore = defineStore('entries', () => {
    const vault = useVaultStore();

    const entries = computed(() => vault.data?.links ?? []);
    const byId = computed(() => new Map(entries.value.map((entry) => [entry.id, entry])));
    const byUrl = computed(() => {
        const map = new Map<string, Entry>();
        for (const entry of entries.value) if (entry.url) map.set(urlKey(entry.url), entry);
        return map;
    });

    function findDuplicate(url: string | null, exceptId?: string) {
        if (!url) return null;
        const found = byUrl.value.get(urlKey(url));
        return found && found.id !== exceptId ? found : null;
    }

    function add(draft: EntryDraft, replaceId?: string) {
        const now = nowIso();
        const entry: Entry = { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
        vault.commit((store) => {
            ensureTags(store.tags, draft.tags);
            store.links = [...store.links.filter((item) => item.id !== replaceId), entry];
        });
        return entry;
    }

    function update(id: string, draft: Partial<EntryDraft>, replaceId?: string) {
        vault.commit((store) => {
            if (draft.tags) ensureTags(store.tags, draft.tags);
            store.links = store.links
                .filter((item) => item.id !== replaceId)
                .map((item) =>
                    item.id === id ? { ...item, ...draft, updatedAt: nowIso() } : item,
                );
        });
    }

    function remove(id: string) {
        vault.commit((store) => {
            store.links = store.links.filter((item) => item.id !== id);
        });
    }

    function restore(entry: Entry) {
        if (byId.value.has(entry.id)) return;
        vault.commit((store) => {
            ensureTags(store.tags, entry.tags);
            store.links = [...store.links, entry];
        });
    }

    function toggleFavorite(id: string) {
        const entry = byId.value.get(id);
        if (entry) update(id, { favorite: !entry.favorite });
    }

    return { entries, byId, findDuplicate, add, update, remove, restore, toggleFavorite };
});
