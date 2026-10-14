<template>
    <ActionsMenu label="Preset actions">
        <DropdownMenuItem @select="dialogs.editPreset(preset.id)">
            <Pencil />
            Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" @select="emit('delete')">
            <Trash2 />
            Delete
        </DropdownMenuItem>
    </ActionsMenu>
</template>

<script setup lang="ts">
    import { Pencil, Trash2 } from 'lucide-vue-next';
    import type { Preset } from '@/core/format';
    import ActionsMenu from '@/components/common/ActionsMenu.vue';
    import { useDialogsStore } from '@/stores/dialogs';
    import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

    defineProps<{ preset: Preset }>();
    const emit = defineEmits<{ delete: [] }>();

    const dialogs = useDialogsStore();
</script>
