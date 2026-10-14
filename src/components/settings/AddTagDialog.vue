<template>
    <AppDialog v-model:open="open" title="Add tag">
        <TagFields
            v-model:tag-key="key"
            v-model:label="label"
            form-id="add-tag"
            :key-error="key.trim() ? keyError : null"
            @submit="submit"
        />
        <template #footer>
            <Button type="submit" form="add-tag" class="flex-1" :disabled="Boolean(keyError)">
                Save
            </Button>
        </template>
    </AppDialog>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import { toast } from 'vue-sonner';
    import { normalizeTagKey, tagKeyError } from '@/core/format';
    import AppDialog from '@/components/common/AppDialog.vue';
    import { Button } from '@/components/ui/button';
    import { useTagsStore } from '@/stores/tags';
    import TagFields from './TagFields.vue';

    const open = defineModel<boolean>('open', { default: false });
    const tags = useTagsStore();
    const key = ref('');
    const label = ref('');

    const keyError = computed(() => tagKeyError(normalizeTagKey(key.value), tags.keys));

    watch(open, (value) => {
        if (!value) return;
        key.value = '';
        label.value = '';
    });

    function submit() {
        if (keyError.value) return;
        const normalized = normalizeTagKey(key.value);
        tags.add(normalized, label.value.trim() || null);
        toast.success(`Tag ${normalized} added`);
        open.value = false;
    }
</script>
