<template>
    <header :class="cn('flex h-14 shrink-0 items-center gap-2 px-4', props.class)">
        <h1 class="min-w-0 flex-1 truncate text-base font-semibold">{{ title }}</h1>
        <slot />
    </header>
</template>

<script setup lang="ts">
    import type { HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{ title: string; class?: HTMLAttributes['class'] }>();
</script>
