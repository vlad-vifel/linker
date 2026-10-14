<template>
    <AlertDialog v-model:open="open">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete tag "{{ tag.key }}"?</AlertDialogTitle>
                <AlertDialogDescription>
                    Used in {{ formatCount(tag.count) }}. Remove the tag only, or delete these
                    entries too.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div class="flex flex-col gap-2">
                <AlertDialogAction variant="outline" @click="emit('delete', false)">
                    <Tag />
                    Delete tag only
                </AlertDialogAction>
                <AlertDialogAction variant="destructive" @click="emit('delete', true)">
                    <Trash2 />
                    Delete tag and entries
                </AlertDialogAction>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
            </div>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
    import { Tag, Trash2 } from 'lucide-vue-next';
    import { formatCount } from '@/lib/format';
    import type { TagOption } from '@/types/tags';
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogHeader,
        AlertDialogTitle,
    } from '@/components/ui/alert-dialog';

    defineProps<{ tag: TagOption }>();
    const emit = defineEmits<{ delete: [withEntries: boolean] }>();

    const open = defineModel<boolean>('open', { default: false });
</script>
