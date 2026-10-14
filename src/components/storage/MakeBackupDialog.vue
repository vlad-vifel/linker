<template>
    <ConfirmDialog v-model:open="open" title="Make backup?" confirm-text="OK" @confirm="make">
        Saved as
        <span class="mt-1 block text-foreground">{{ fileName }}</span>
    </ConfirmDialog>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { toast } from 'vue-sonner';
    import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
    import { FILE_EXTENSION } from '@/core/format';
    import { backupFileName, errorMessage, localStamp } from '@/core/storage';
    import { useVaultStore } from '@/stores/vault';
    import type { StorageRef } from '@/types/storage';

    const props = defineProps<{ item: StorageRef }>();

    const open = defineModel<boolean>('open', { default: false });
    const vault = useVaultStore();
    const stamp = ref(localStamp());
    const fileName = ref('');

    watch(open, (value) => {
        if (!value) return;
        stamp.value = localStamp();
        fileName.value = backupFileName(props.item.path, FILE_EXTENSION, stamp.value);
    });

    async function make() {
        try {
            await vault.makeBackup(stamp.value);
            toast.success('Backup saved');
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }
</script>
