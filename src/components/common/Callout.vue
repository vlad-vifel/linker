<template>
    <div
        :class="
            cn(
                'flex items-center gap-2 rounded-lg border p-3 text-sm',
                CALLOUT_VARIANTS[variant],
                props.class,
            )
        "
    >
        <component :is="icon" v-if="icon" class="size-5 shrink-0" />
        <slot />
    </div>
</template>

<script setup lang="ts">
    import type { Component, HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';
    import { CALLOUT_VARIANTS } from './const';
    import type { CalloutVariant } from './types';

    const props = defineProps<{
        variant: CalloutVariant;
        icon?: Component;
        class?: HTMLAttributes['class'];
    }>();
</script>
