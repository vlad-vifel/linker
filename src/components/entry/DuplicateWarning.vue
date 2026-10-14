<template>
    <Callout variant="warning" class="flex-col items-stretch text-foreground">
        <p class="font-medium text-warning">Already saved. {{ formatDateTime(entry.createdAt) }}</p>
        <TagChips v-if="entry.tags.length" :keys="entry.tags" />
        <p v-if="entry.note" class="line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">
            {{ entry.note }}
        </p>
    </Callout>
</template>

<script setup lang="ts">
    import Callout from '@/components/common/Callout.vue';
    import TagChips from '@/components/tags/TagChips.vue';
    import type { Entry } from '@/core/format';
    import { formatDateTime } from '@/lib/format';

    defineProps<{ entry: Entry }>();
</script>
