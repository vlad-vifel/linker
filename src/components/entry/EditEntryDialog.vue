<template>
    <AppDialog :open="Boolean(entry)" title="Edit" @update:open="onOpen">
        <EntryForm v-if="entry" :key="entry.id" ref="form" :entry="entry" @submit="save" />
        <template v-if="entry" #footer>
            <EntryFormFooter :form="form" />
        </template>
    </AppDialog>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { toast } from 'vue-sonner';
    import AppDialog from '@/components/common/AppDialog.vue';
    import { useDialogsStore } from '@/stores/dialogs';
    import { useEntriesStore } from '@/stores/entries';
    import EntryForm from './EntryForm.vue';
    import EntryFormFooter from './EntryFormFooter.vue';
    import type { EntrySubmit } from './types';

    const dialogs = useDialogsStore();
    const entries = useEntriesStore();
    const form = ref<InstanceType<typeof EntryForm> | null>(null);

    const entry = computed(() =>
        dialogs.editId ? (entries.byId.get(dialogs.editId) ?? null) : null,
    );

    function onOpen(open: boolean) {
        if (!open) dialogs.closeEdit();
    }

    function save({ draft, replaceId }: EntrySubmit) {
        if (!entry.value) return;
        entries.update(entry.value.id, draft, replaceId);
        toast.success('Saved');
        dialogs.closeEdit();
    }
</script>
