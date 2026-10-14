<template>
    <div ref="root">
        <EntryRow
            v-for="entry in visible"
            :key="entry.id"
            :entry="entry"
            @delete="deleting = $event"
        />
        <div v-if="visible.length < items.length" ref="sentinel" class="h-16" />
        <DeleteEntryDialog
            v-if="deleting"
            :open="true"
            :entry="deleting"
            @update:open="deleting = null"
        />
    </div>
</template>

<script setup lang="ts">
    import { useIntersectionObserver } from '@vueuse/core';
    import { computed, nextTick, ref, watch } from 'vue';
    import type { Entry } from '@/core/format';
    import { FEED_CHUNK } from './const';
    import DeleteEntryDialog from '@/components/entry/DeleteEntryDialog.vue';
    import EntryRow from './EntryRow.vue';

    const props = defineProps<{
        items: Entry[];
        resetKey: string;
    }>();

    const deleting = ref<Entry | null>(null);
    const limit = ref(FEED_CHUNK);
    const sentinel = ref<HTMLElement | null>(null);
    const root = ref<HTMLElement | null>(null);
    const visible = computed(() => props.items.slice(0, limit.value));

    async function reveal(id: string) {
        const index = props.items.findIndex((entry) => entry.id === id);
        if (index === -1) return null;
        if (index >= limit.value) limit.value = index + FEED_CHUNK;
        await nextTick();
        return root.value?.querySelector<HTMLElement>(`[data-id="${id}"]`) ?? null;
    }

    defineExpose({ reveal });

    watch(
        () => props.resetKey,
        () => (limit.value = FEED_CHUNK),
    );

    useIntersectionObserver(
        sentinel,
        ([entry]) => {
            if (entry?.isIntersecting) limit.value += FEED_CHUNK;
        },
        { rootMargin: '400px' },
    );
</script>
