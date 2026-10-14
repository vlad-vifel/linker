import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PresetDraft } from '@/core/format';

export const useDialogsStore = defineStore('dialogs', () => {
    const viewId = ref<string | null>(null);
    const editId = ref<string | null>(null);
    const presetOpen = ref(false);
    const presetId = ref<string | null>(null);
    const presetInitial = ref<PresetDraft | null>(null);

    function viewEntry(id: string) {
        viewId.value = id;
    }

    function editEntry(id: string) {
        editId.value = id;
    }

    function addPreset(initial: PresetDraft | null = null) {
        presetId.value = null;
        presetInitial.value = initial;
        presetOpen.value = true;
    }

    function editPreset(id: string) {
        presetId.value = id;
        presetInitial.value = null;
        presetOpen.value = true;
    }

    function closeView() {
        viewId.value = null;
    }

    function closeEdit() {
        editId.value = null;
    }

    function closePreset() {
        presetOpen.value = false;
    }

    return {
        viewId,
        editId,
        presetOpen,
        presetId,
        presetInitial,
        viewEntry,
        editEntry,
        addPreset,
        editPreset,
        closeView,
        closeEdit,
        closePreset,
    };
});
