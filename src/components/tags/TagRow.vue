<template>
    <button
        type="button"
        :role="selectable ? 'option' : undefined"
        :aria-selected="selectable ? selected : undefined"
        class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted/60 active:bg-muted"
        @click="emit('select')"
    >
        <span class="flex min-w-0 flex-1 items-center gap-2">
            <span v-if="title" class="truncate text-sm">{{ title }}</span>
            <TagChip v-if="tagKey" :text="tagKey" />
            <span v-if="count !== undefined" class="text-xs text-muted-foreground tabular-nums">
                ({{ count }})
            </span>
        </span>
        <span v-if="selectable" class="flex size-4 shrink-0">
            <Check v-if="selected" class="size-4" />
        </span>
    </button>
</template>

<script setup lang="ts">
    import { Check } from 'lucide-vue-next';
    import TagChip from './TagChip.vue';

    defineProps<{
        title?: string | null;
        tagKey?: string;
        count?: number;
        selectable?: boolean;
        selected?: boolean;
    }>();
    const emit = defineEmits<{ select: [] }>();
</script>
