<template>
    <ConfirmDialog
        v-model:open="open"
        :title="`Remove ${item.name} from list?`"
        description="File stays on disk. You can add it again with Import file."
        confirm-text="Remove"
        destructive
        @confirm="remove"
    />
</template>

<script setup lang="ts">
    import { toast } from 'vue-sonner';
    import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
    import { useStorageActions } from '@/composables/useStorageActions';
    import { errorMessage } from '@/core/storage';
    import type { StorageRef } from '@/types/storage';

    const props = defineProps<{ item: StorageRef }>();
    const open = defineModel<boolean>('open', { default: false });

    const actions = useStorageActions();

    async function remove() {
        try {
            await actions.remove(props.item);
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }
</script>
