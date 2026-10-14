<template>
    <div
        class="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-10 text-center"
    >
        <component :is="icon" class="mb-1 size-8 text-muted-foreground" />
        <p class="text-sm font-medium">{{ title }}</p>
        <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
        <slot />
    </div>
</template>

<script setup lang="ts">
    import type { Component } from 'vue';

    defineProps<{ icon: Component; title: string; description?: string }>();
</script>
