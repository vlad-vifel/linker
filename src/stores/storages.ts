import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { samePath } from '@/core/storage';
import { readJson, writeJson } from '@/lib/localStore';
import type { StorageRef } from '@/types/storage';

const LIST_KEY = 'linker.storages';
const ACTIVE_KEY = 'linker.active';

export const useStoragesStore = defineStore('storages', () => {
    const list = ref<StorageRef[]>(readJson(LIST_KEY, []));
    const activeId = ref<string | null>(readJson(ACTIVE_KEY, null));

    const active = computed(
        () => list.value.find((item) => item.id === activeId.value) ?? list.value[0] ?? null,
    );

    watch(list, (value) => writeJson(LIST_KEY, value), { deep: true });
    watch(activeId, (value) => writeJson(ACTIVE_KEY, value));

    function findByPath(path: string) {
        return list.value.find((item) => samePath(item.path, path)) ?? null;
    }

    function add(item: Omit<StorageRef, 'id'>) {
        const created = { ...item, id: crypto.randomUUID() };
        list.value.push(created);
        return created;
    }

    function update(id: string, patch: Partial<Omit<StorageRef, 'id'>>) {
        const item = list.value.find((entry) => entry.id === id);
        if (item) Object.assign(item, patch);
    }

    function remove(id: string) {
        list.value = list.value.filter((item) => item.id !== id);
        if (activeId.value === id) activeId.value = list.value[0]?.id ?? null;
    }

    function setActive(id: string) {
        activeId.value = id;
    }

    return { list, active, findByPath, add, update, remove, setActive };
});
