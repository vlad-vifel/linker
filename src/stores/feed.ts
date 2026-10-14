import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useFeedStore = defineStore('feed', () => {
    const tags = ref<string[]>([]);
    const favoritesOnly = ref(false);
    const newestFirst = ref(true);
    const query = ref('');

    const hasFilters = computed(
        () => tags.value.length > 0 || favoritesOnly.value || query.value.trim() !== '',
    );

    function clear() {
        tags.value = [];
        favoritesOnly.value = false;
        query.value = '';
    }

    function showTag(tag: string) {
        clear();
        tags.value = [tag];
    }

    function showPreset(preset: { tags: string[]; favorite: boolean }) {
        clear();
        tags.value = [...preset.tags];
        favoritesOnly.value = preset.favorite;
    }

    return { tags, favoritesOnly, newestFirst, query, hasFilters, clear, showTag, showPreset };
});
