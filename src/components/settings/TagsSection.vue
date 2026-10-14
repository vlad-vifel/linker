<template>
    <SettingsSection
        title="Tags"
        :description="`${pluralize(tags.options.length, 'tag', 'tags')}. Tap to edit key and label.`"
    >
        <div class="flex flex-col gap-3">
            <Button variant="outline" @click="addOpen = true">
                <Plus />
                Add tag
            </Button>
            <div class="flex gap-2">
                <Input v-model="search" placeholder="Search tags" class="flex-1" />
                <SortButton v-model="mostUsedFirst" />
            </div>
            <div class="-mx-3 flex flex-col">
                <TagRow
                    v-if="!search"
                    :title="tags.noTagLabel"
                    :count="tags.noTagCount"
                    @select="noTagOpen = true"
                />
                <TagRow
                    v-for="tag in visible"
                    :key="tag.key"
                    :title="tag.label"
                    :tag-key="tag.key"
                    :count="tag.count"
                    @select="editingKey = tag.key"
                />
                <p
                    v-if="!visible.length && search"
                    class="p-3 text-center text-sm text-muted-foreground"
                >
                    No tags
                </p>
            </div>
        </div>
        <AddTagDialog v-model:open="addOpen" />
        <NoTagEditDialog v-model:open="noTagOpen" />
        <TagEditDialog
            v-if="editing"
            :key="editing.key"
            :tag="editing"
            :open="true"
            @update:open="(value) => !value && (editingKey = null)"
        />
    </SettingsSection>
</template>

<script setup lang="ts">
    import { Plus } from 'lucide-vue-next';
    import { computed, ref } from 'vue';
    import SortButton from '@/components/common/SortButton.vue';
    import TagRow from '@/components/tags/TagRow.vue';
    import { matchTags } from '@/components/tags/utils';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { pluralize } from '@/lib/format';
    import { useTagsStore } from '@/stores/tags';
    import AddTagDialog from './AddTagDialog.vue';
    import NoTagEditDialog from './NoTagEditDialog.vue';
    import SettingsSection from './SettingsSection.vue';
    import TagEditDialog from './TagEditDialog.vue';

    const tags = useTagsStore();
    const search = ref('');
    const mostUsedFirst = ref(true);
    const addOpen = ref(false);
    const noTagOpen = ref(false);
    const editingKey = ref<string | null>(null);
    const editing = computed(() => tags.options.find((tag) => tag.key === editingKey.value));

    const visible = computed(() => {
        const matched = matchTags(tags.options, search.value);
        return mostUsedFirst.value ? matched : [...matched].reverse();
    });
</script>
