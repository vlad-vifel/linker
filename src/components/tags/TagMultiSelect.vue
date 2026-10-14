<template>
    <TagSelectTrigger
        :keys="modelValue"
        :placeholder="placeholder"
        :class="props.class"
        @open="open = true"
        @clear="modelValue = []"
    />
    <AppDialog v-model:open="open" :title="title">
        <SearchInput
            v-model="search"
            placeholder="Search tags"
            @keydown.enter.prevent="submitSearch"
        />
        <div role="listbox" aria-multiselectable="true" class="-mx-2 flex flex-col">
            <TagRow
                v-if="createKey"
                :title="`Create tag &quot;${createKey}&quot;`"
                :selected="false"
                selectable
                @select="create"
            />
            <TagRow
                v-if="noTag && !search"
                :title="tags.noTagLabel"
                :count="tags.noTagCount"
                :selected="modelValue.includes(NO_TAG)"
                selectable
                @select="toggle(NO_TAG)"
            />
            <TagRow
                v-for="option in visibleOptions"
                :key="option.key"
                :title="option.label"
                :tag-key="option.key"
                :count="option.count"
                :selected="modelValue.includes(option.key)"
                selectable
                @select="toggle(option.key)"
            />
            <p
                v-if="!visibleOptions.length && !createKey"
                class="p-4 text-center text-sm text-muted-foreground"
            >
                No tags found
            </p>
        </div>
        <template #footer>
            <Button
                variant="outline"
                class="flex-1"
                :disabled="!modelValue.length"
                @click="modelValue = []"
            >
                Clear
            </Button>
            <Button class="flex-1" @click="open = false">Done</Button>
        </template>
    </AppDialog>
</template>

<script setup lang="ts">
    import { computed, ref, watch, type HTMLAttributes } from 'vue';
    import { NO_TAG, normalizeTagKey, tagKeyError } from '@/core/format';
    import AppDialog from '@/components/common/AppDialog.vue';
    import SearchInput from '@/components/common/SearchInput.vue';
    import { Button } from '@/components/ui/button';
    import { useTagsStore } from '@/stores/tags';
    import TagRow from './TagRow.vue';
    import TagSelectTrigger from './TagSelectTrigger.vue';
    import { matchTags, selectedFirst, toggleTag } from './utils';

    const props = withDefaults(
        defineProps<{
            title?: string;
            placeholder?: string;
            noTag?: boolean;
            creatable?: boolean;
            class?: HTMLAttributes['class'];
        }>(),
        { title: 'Tags', placeholder: 'Tags', class: undefined },
    );

    const modelValue = defineModel<string[]>({ required: true });
    const tags = useTagsStore();
    const open = ref(false);
    const search = ref('');

    const allOptions = computed(() => {
        const known = new Set(tags.keys);
        const pending = modelValue.value
            .filter((key) => key !== NO_TAG && !known.has(key))
            .map((key) => ({ key, label: null, count: 0 }));
        return [...tags.options, ...pending];
    });
    const visibleOptions = computed(() =>
        selectedFirst(matchTags(allOptions.value, search.value), modelValue.value),
    );
    const createKey = computed(() => {
        if (!props.creatable) return null;
        const key = normalizeTagKey(search.value);
        const keys = allOptions.value.map((option) => option.key);
        return tagKeyError(key, keys) ? null : key;
    });

    watch(open, (value) => {
        if (!value) search.value = '';
    });

    function toggle(key: string) {
        modelValue.value = toggleTag(modelValue.value, key);
    }

    function submitSearch() {
        if (createKey.value) return create();
        const first = search.value.trim() ? visibleOptions.value[0] : null;
        if (first) toggle(first.key);
    }

    function create() {
        if (!createKey.value) return;
        toggle(createKey.value);
        search.value = '';
    }
</script>
