<template>
    <div
        :class="
            cn(
                'flex items-center gap-2 rounded-md border border-input bg-input/30 py-3.5 pr-1 pl-3 shadow-xs transition-colors hover:bg-input/50 has-[[data-main]:active]:bg-input/80',
                props.class,
            )
        "
    >
        <button type="button" data-main class="min-w-0 flex-1 text-left" @click="emit('select')">
            <slot />
        </button>
        <slot name="actions" />
    </div>
</template>

<script setup lang="ts">
    import type { HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{ class?: HTMLAttributes['class'] }>();
    const emit = defineEmits<{ select: [] }>();
</script>
