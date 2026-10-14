<template>
    <div ref="scroller" class="h-full overflow-y-auto" @scroll.passive="onScroll">
        <PageHeader title="Links" class="-mb-3" />
        <FeedToolbar :count="filtered.length" @random="random" />
        <FeedList v-if="filtered.length" ref="list" :items="filtered" :reset-key="resetKey" />
        <div v-else class="p-4">
            <EmptyState
                :icon="SearchX"
                :title="feed.hasFilters ? 'No entries match' : 'No entries yet'"
                :description="feed.hasFilters ? undefined : 'Add your first link'"
            >
                <Button
                    v-if="feed.hasFilters"
                    variant="outline"
                    size="sm"
                    class="mt-2"
                    @click="feed.clear()"
                >
                    Clear filters
                </Button>
                <Button v-else size="sm" class="mt-2" @click="router.push('/add')">Add link</Button>
            </EmptyState>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { refDebounced } from '@vueuse/core';
    import { SearchX } from 'lucide-vue-next';
    import { computed, onActivated, onDeactivated, ref, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import EmptyState from '@/components/common/EmptyState.vue';
    import FeedList from '@/components/links/FeedList.vue';
    import FeedToolbar from '@/components/links/FeedToolbar.vue';
    import PageHeader from '@/components/layout/PageHeader.vue';
    import { filterEntries, pickRandom, scrollToCenter } from '@/components/links/utils';
    import { Button } from '@/components/ui/button';
    import { useEntriesStore } from '@/stores/entries';
    import { useFeedStore } from '@/stores/feed';
    import { useHighlightStore } from '@/stores/highlight';

    defineOptions({ name: 'LinksView' });

    const router = useRouter();
    const feed = useFeedStore();
    const entries = useEntriesStore();
    const highlight = useHighlightStore();
    const scroller = ref<HTMLElement | null>(null);
    const list = ref<InstanceType<typeof FeedList> | null>(null);
    const query = refDebounced(
        computed(() => feed.query),
        150,
    );
    let lastRandom: string | null = null;
    let scrollTop = 0;
    let active = true;

    const filtered = computed(() =>
        filterEntries(entries.entries, {
            tags: feed.tags,
            favoritesOnly: feed.favoritesOnly,
            newestFirst: feed.newestFirst,
            query: query.value,
        }),
    );
    const resetKey = computed(() =>
        JSON.stringify([feed.tags, feed.favoritesOnly, feed.newestFirst, query.value]),
    );

    watch(resetKey, () => {
        scrollTop = 0;
        scroller.value?.scrollTo({ top: 0 });
    });

    async function random() {
        const entry = pickRandom(filtered.value, lastRandom);
        if (!entry || !scroller.value) return;
        lastRandom = entry.id;
        const row = await list.value?.reveal(entry.id);
        if (!row) return;
        await scrollToCenter(scroller.value, row);
        highlight.flash(entry.id);
    }

    function onScroll() {
        if (active) scrollTop = scroller.value?.scrollTop ?? 0;
    }

    onActivated(() => {
        active = true;
        scroller.value?.scrollTo({ top: scrollTop });
    });
    onDeactivated(() => (active = false));
</script>
