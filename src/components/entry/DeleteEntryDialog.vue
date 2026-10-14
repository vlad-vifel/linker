<template>
    <ConfirmDialog
        v-model:open="open"
        title="Delete entry?"
        :description="entry.url ?? entry.note ?? undefined"
        confirm-text="Delete"
        destructive
        @confirm="remove"
    />
</template>

<script setup lang="ts">
    import { toast } from 'vue-sonner';
    import type { Entry } from '@/core/format';
    import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
    import { useEntriesStore } from '@/stores/entries';

    const UNDO_MS = 6000;

    const props = defineProps<{ entry: Entry }>();
    const emit = defineEmits<{ deleted: [] }>();

    const open = defineModel<boolean>('open', { default: false });
    const entries = useEntriesStore();

    function remove() {
        const removed = props.entry;
        emit('deleted');
        entries.remove(removed.id);
        toast.success('Deleted', {
            duration: UNDO_MS,
            action: { label: 'Undo', onClick: () => entries.restore(removed) },
        });
    }
</script>
