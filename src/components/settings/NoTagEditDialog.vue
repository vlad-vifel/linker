<template>
    <AppDialog
        v-model:open="open"
        title="Edit no tag"
        :hint="String(tags.noTagCount)"
        description="Entries without tags. Only the label can be changed."
    >
        <TagFields v-model:label="label" form-id="edit-no-tag" @submit="submit" />
        <template #footer>
            <Button
                variant="destructive"
                class="flex-1"
                :disabled="!tags.noTagCount"
                @click="deleteOpen = true"
            >
                <Trash2 />
                Delete
            </Button>
            <Button type="submit" form="edit-no-tag" class="flex-1">Save</Button>
        </template>
    </AppDialog>
    <ConfirmDialog
        v-model:open="deleteOpen"
        title="Delete entries without tags?"
        :description="`${formatCount(tags.noTagCount)} will be deleted. The label is reset to default.`"
        confirm-text="Delete"
        destructive
        @confirm="remove"
    />
</template>

<script setup lang="ts">
    import { Trash2 } from 'lucide-vue-next';
    import { ref, watch } from 'vue';
    import { toast } from 'vue-sonner';
    import AppDialog from '@/components/common/AppDialog.vue';
    import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
    import { NO_TAG } from '@/core/format';
    import { Button } from '@/components/ui/button';
    import { formatCount } from '@/lib/format';
    import { useFeedStore } from '@/stores/feed';
    import { useTagsStore } from '@/stores/tags';
    import TagFields from './TagFields.vue';

    const open = defineModel<boolean>('open', { default: false });
    const tags = useTagsStore();
    const feed = useFeedStore();
    const deleteOpen = ref(false);
    const label = ref(tags.noTagLabel);

    watch(open, (value) => {
        if (value) label.value = tags.noTagLabel;
    });

    function remove() {
        tags.removeUntagged();
        feed.tags = feed.tags.filter((tag) => tag !== NO_TAG);
        toast.success('Entries deleted');
        open.value = false;
    }

    function submit() {
        tags.setNoTagLabel(label.value.trim() || null);
        open.value = false;
    }
</script>
