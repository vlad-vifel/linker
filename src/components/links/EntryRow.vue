<template>
    <article
        :data-id="entry.id"
        :class="
            cn(
                'flex items-center gap-2 border-b border-border/50 py-4 pr-2 pl-4 transition-colors has-[[data-main]:active]:bg-muted',
                highlight.isActive(entry.id) && 'duration-500',
                highlight.isLit(entry.id) && 'bg-muted',
            )
        "
    >
        <button
            type="button"
            data-main
            class="flex min-w-0 flex-1 flex-col gap-1.5 text-left"
            @click="onClick"
        >
            <p v-if="url" class="flex items-center gap-1.5 text-sm leading-6">
                <Link2 class="size-4 shrink-0 text-muted-foreground" />
                <span class="truncate">
                    <span class="font-medium">{{ url.host }}</span>
                    <span class="text-muted-foreground">{{ url.path }}</span>
                </span>
            </p>
            <p v-else-if="entry.note" class="truncate text-sm leading-6">
                {{ firstLine(entry.note) }}
            </p>
            <TagChips
                v-if="entry.tags.length || noteChip"
                :keys="entry.tags"
                class="scrollbar-none flex-nowrap overflow-x-auto"
            >
                <TagChip v-if="noteChip" muted aria-label="Has note">
                    <TextIcon class="size-4" />
                </TagChip>
            </TagChips>
        </button>
        <div class="flex shrink-0 flex-col items-end">
            <div class="flex">
                <FavoriteButton
                    :active="entry.favorite"
                    variant="ghost"
                    size="icon-sm"
                    @toggle="entries.toggleFavorite(entry.id)"
                />
                <EntryMenu :entry="entry" @delete="emit('delete', entry)" />
            </div>
            <span class="pr-2 text-xs text-muted-foreground tabular-nums">
                {{ formatDate(entry.createdAt) }}
            </span>
        </div>
    </article>
</template>

<script setup lang="ts">
    import { Link2, TextIcon } from 'lucide-vue-next';
    import { computed } from 'vue';
    import { formatDate } from '@/lib/format';
    import { cn } from '@/lib/utils';
    import type { Entry } from '@/core/format';
    import FavoriteButton from '@/components/entry/FavoriteButton.vue';
    import TagChip from '@/components/tags/TagChip.vue';
    import TagChips from '@/components/tags/TagChips.vue';
    import { useDialogsStore } from '@/stores/dialogs';
    import { useEntriesStore } from '@/stores/entries';
    import { useHighlightStore } from '@/stores/highlight';
    import EntryMenu from './EntryMenu.vue';
    import { displayUrl, firstLine, openLink, openableUrl } from './utils';

    const props = defineProps<{ entry: Entry }>();
    const emit = defineEmits<{ delete: [entry: Entry] }>();

    const dialogs = useDialogsStore();
    const entries = useEntriesStore();
    const highlight = useHighlightStore();
    const url = computed(() => (props.entry.url ? displayUrl(props.entry.url) : null));
    const href = computed(() => openableUrl(props.entry.url));
    const noteChip = computed(() => Boolean(props.entry.url && props.entry.note));

    function onClick() {
        if (href.value) openLink(href.value);
        else dialogs.viewEntry(props.entry.id);
    }
</script>
