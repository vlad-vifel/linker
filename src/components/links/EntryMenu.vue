<template>
    <ActionsMenu label="Entry actions">
        <DropdownMenuItem @select="dialogs.viewEntry(entry.id)">
            <Eye />
            View
        </DropdownMenuItem>
        <DropdownMenuItem @select="dialogs.editEntry(entry.id)">
            <Pencil />
            Edit
        </DropdownMenuItem>
        <DropdownMenuItem v-if="entry.url" @select="copy">
            <Copy />
            Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" @select="emit('delete')">
            <Trash2 />
            Delete
        </DropdownMenuItem>
    </ActionsMenu>
</template>

<script setup lang="ts">
    import { Copy, Eye, Pencil, Trash2 } from 'lucide-vue-next';
    import { toast } from 'vue-sonner';
    import type { Entry } from '@/core/format';
    import { writeClipboard } from '@/lib/clipboard';
    import ActionsMenu from '@/components/common/ActionsMenu.vue';
    import { useDialogsStore } from '@/stores/dialogs';
    import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

    const props = defineProps<{ entry: Entry }>();
    const emit = defineEmits<{ delete: [] }>();

    const dialogs = useDialogsStore();

    async function copy() {
        try {
            await writeClipboard(props.entry.url ?? '');
            toast.success('Link copied');
        } catch {
            toast.error('Could not copy');
        }
    }
</script>
