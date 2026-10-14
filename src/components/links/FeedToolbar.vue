<template>
    <div
        class="sticky top-0 z-10 flex flex-col gap-2 border-b border-border/50 bg-background px-4 pt-3 pb-2"
    >
        <div class="flex items-start gap-2">
            <TagMultiSelect v-model="feed.tags" no-tag class="flex-1" />
            <FavoriteButton
                :active="feed.favoritesOnly"
                @toggle="feed.favoritesOnly = !feed.favoritesOnly"
            />
            <SortButton v-model="feed.newestFirst" />
        </div>
        <div class="flex items-center gap-2">
            <SearchInput v-model="feed.query" placeholder="Search URL or note" class="flex-1" />
            <Button
                variant="outline"
                size="icon"
                aria-label="Random entry"
                :disabled="!count"
                @click="emit('random')"
            >
                <Dices />
            </Button>
        </div>
        <p class="text-xs text-muted-foreground">{{ formatCount(count) }}</p>
    </div>
</template>

<script setup lang="ts">
    import { Dices } from 'lucide-vue-next';
    import SearchInput from '@/components/common/SearchInput.vue';
    import SortButton from '@/components/common/SortButton.vue';
    import FavoriteButton from '@/components/entry/FavoriteButton.vue';
    import TagMultiSelect from '@/components/tags/TagMultiSelect.vue';
    import { Button } from '@/components/ui/button';
    import { formatCount } from '@/lib/format';
    import { useFeedStore } from '@/stores/feed';

    defineProps<{ count: number }>();
    const emit = defineEmits<{ random: [] }>();

    const feed = useFeedStore();
</script>
