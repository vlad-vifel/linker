<template>
    <button
        type="button"
        :class="
            cn(
                'flex h-12 items-center gap-2 rounded-md border border-input px-3 text-left text-sm shadow-xs transition-colors active:bg-input/80',
                selected ? 'bg-input/60' : 'bg-input/30 hover:bg-input/50',
            )
        "
        @click="emit('select')"
    >
        <History class="size-5 shrink-0 text-muted-foreground" />
        <span class="flex-1 tabular-nums">{{ displayStamp(stamp) }}</span>
        <StatusChip v-if="selected">selected</StatusChip>
    </button>
</template>

<script setup lang="ts">
    import { History } from 'lucide-vue-next';
    import StatusChip from '@/components/common/StatusChip.vue';
    import { displayStamp } from '@/core/storage';
    import { cn } from '@/lib/utils';

    defineProps<{ stamp: string; selected: boolean }>();
    const emit = defineEmits<{ select: [] }>();
</script>
