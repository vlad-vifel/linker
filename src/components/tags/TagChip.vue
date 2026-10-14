<template>
    <span
        :class="
            cn(
                'inline-flex h-6 max-w-full shrink-0 items-center gap-1 rounded-md px-1.5 text-xs',
                muted
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-foreground font-medium text-background',
                props.class,
            )
        "
    >
        <slot>
            <span class="truncate">{{ text }}</span>
        </slot>
    </span>
</template>

<script setup lang="ts">
    import type { HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{
        text?: string;
        muted?: boolean;
        class?: HTMLAttributes['class'];
    }>();
</script>
