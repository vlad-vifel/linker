<template>
    <AppDialog v-model:open="open" title="Edit tag" :hint="String(tag.count)">
        <TagFields
            v-model:tag-key="key"
            v-model:label="label"
            form-id="edit-tag"
            :key-error="keyError"
            :merge-into="mergeInto"
            @submit="submit"
        />
        <template #footer>
            <Button variant="destructive" class="flex-1" @click="deleteOpen = true">
                <Trash2 />
                Delete
            </Button>
            <Button type="submit" form="edit-tag" class="flex-1" :disabled="Boolean(keyError)">
                {{ mergeInto ? 'Merge' : 'Save' }}
            </Button>
        </template>
    </AppDialog>
    <DeleteTagDialog v-model:open="deleteOpen" :tag="tag" @delete="remove" />
</template>

<script setup lang="ts">
    import { Trash2 } from 'lucide-vue-next';
    import { computed, ref } from 'vue';
    import { toast } from 'vue-sonner';
    import { normalizeTagKey, tagKeyError } from '@/core/format';
    import AppDialog from '@/components/common/AppDialog.vue';
    import type { TagOption } from '@/types/tags';
    import { Button } from '@/components/ui/button';
    import { useFeedStore } from '@/stores/feed';
    import { useTagsStore } from '@/stores/tags';
    import DeleteTagDialog from './DeleteTagDialog.vue';
    import TagFields from './TagFields.vue';

    const props = defineProps<{ tag: TagOption }>();

    const open = defineModel<boolean>('open', { default: false });
    const tags = useTagsStore();
    const feed = useFeedStore();
    const key = ref(props.tag.key);
    const label = ref(props.tag.label ?? '');
    const deleteOpen = ref(false);

    const normalized = computed(() => normalizeTagKey(key.value));
    const keyError = computed(() => tagKeyError(normalized.value));
    const mergeInto = computed(() =>
        normalized.value !== props.tag.key && tags.keys.includes(normalized.value)
            ? normalized.value
            : null,
    );

    function submit() {
        if (keyError.value) return;
        const target = normalized.value;
        const merging = Boolean(mergeInto.value);
        tags.rename(props.tag.key, target);
        if (merging) toast.success(`Merged into ${target}`);
        else tags.setLabel(target, label.value.trim() || null);
        feed.tags = [...new Set(feed.tags.map((tag) => (tag === props.tag.key ? target : tag)))];
        open.value = false;
    }

    function remove(withEntries: boolean) {
        tags.remove(props.tag.key, withEntries);
        feed.tags = feed.tags.filter((tag) => tag !== props.tag.key);
        toast.success(withEntries ? 'Tag and entries deleted' : 'Tag deleted');
        open.value = false;
    }
</script>
