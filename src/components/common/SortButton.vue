<template>
    <Button
        variant="outline"
        size="icon"
        :aria-label="descending ? 'Descending' : 'Ascending'"
        @click="descending = !descending"
    >
        <ArrowDownWideNarrow v-if="descending" />
        <ArrowUpNarrowWide v-else />
    </Button>
</template>

<script setup lang="ts">
    import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-vue-next';
    import { Button } from '@/components/ui/button';

    const descending = defineModel<boolean>({ required: true });
</script>
