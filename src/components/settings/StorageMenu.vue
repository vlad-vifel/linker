<template>
    <ActionsMenu label="Storage actions" content-class="w-44">
        <DropdownMenuItem @select="exportCopy">
            <Upload />
            Export
        </DropdownMenuItem>
        <DropdownMenuItem @select="renameOpen = true">
            <Pencil />
            Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" @select="removeOpen = true">
            <X />
            Remove from list
        </DropdownMenuItem>
    </ActionsMenu>
    <RenameStorageDialog v-model:open="renameOpen" :item="item" />
    <RemoveStorageDialog v-model:open="removeOpen" :item="item" />
</template>

<script setup lang="ts">
    import { Pencil, Upload, X } from 'lucide-vue-next';
    import { ref } from 'vue';
    import { toast } from 'vue-sonner';
    import ActionsMenu from '@/components/common/ActionsMenu.vue';
    import RemoveStorageDialog from '@/components/storage/RemoveStorageDialog.vue';
    import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
    import { errorMessage } from '@/core/storage';
    import { useStorageActions } from '@/composables/useStorageActions';
    import type { StorageRef } from '@/types/storage';
    import RenameStorageDialog from './RenameStorageDialog.vue';

    const props = defineProps<{ item: StorageRef }>();

    const actions = useStorageActions();
    const renameOpen = ref(false);
    const removeOpen = ref(false);

    async function exportCopy() {
        try {
            await actions.exportCopy(props.item);
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }
</script>
