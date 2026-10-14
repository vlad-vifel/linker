<template>
    <div :class="cn('flex flex-wrap gap-1', props.class)">
        <template v-for="key in sorted" :key="key">
            <button v-if="clickable" type="button" @click="emit('select', key)">
                <TagChip :text="tags.text(key)" />
            </button>
            <TagChip v-else :text="tags.text(key)" />
        </template>
        <slot />
    </div>
</template>

<script setup lang="ts">
    import { computed, type HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';
    import { useTagsStore } from '@/stores/tags';
    import TagChip from './TagChip.vue';

    const props = defineProps<{
        keys: string[];
        clickable?: boolean;
        class?: HTMLAttributes['class'];
    }>();
    const emit = defineEmits<{ select: [key: string] }>();

    const tags = useTagsStore();
    const sorted = computed(() => tags.sortByUsage(props.keys));
</script>
