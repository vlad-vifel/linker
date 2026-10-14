<template>
    <div class="flex flex-col gap-5">
        <p v-if="entry.favorite" class="flex items-center gap-2 text-sm font-medium">
            <Star class="size-5 fill-warning text-warning" />
            Favorite
        </p>
        <section v-if="entry.url" class="flex flex-col gap-1.5">
            <h2 class="text-xs font-medium text-muted-foreground">URL</h2>
            <button
                v-if="href"
                type="button"
                class="flex items-start gap-2 text-left text-sm break-all text-primary hover:underline"
                @click="openLink(href)"
            >
                {{ entry.url }}
                <ExternalLink class="mt-1 size-4 shrink-0" />
            </button>
            <p v-else class="text-sm break-all">{{ entry.url }}</p>
        </section>
        <section class="flex flex-col gap-1.5">
            <h2 class="text-xs font-medium text-muted-foreground">Tags</h2>
            <TagChips
                v-if="entry.tags.length"
                :keys="entry.tags"
                clickable
                class="gap-1.5"
                @select="emit('tag', $event)"
            />
            <p v-else class="text-sm text-muted-foreground">No tags</p>
        </section>
        <section v-if="entry.note" class="flex flex-col gap-1.5">
            <h2 class="text-xs font-medium text-muted-foreground">Note</h2>
            <p class="text-sm break-words whitespace-pre-line">{{ entry.note }}</p>
        </section>
        <section class="flex flex-col gap-1 text-xs text-muted-foreground">
            <p>Created {{ formatDateTime(entry.createdAt) }}</p>
            <p v-if="entry.updatedAt !== entry.createdAt">
                Updated {{ formatDateTime(entry.updatedAt) }}
            </p>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { ExternalLink, Star } from 'lucide-vue-next';
    import { computed } from 'vue';
    import type { Entry } from '@/core/format';
    import { formatDateTime } from '@/lib/format';
    import { openLink, openableUrl } from '@/components/links/utils';
    import TagChips from '@/components/tags/TagChips.vue';

    const props = defineProps<{ entry: Entry }>();
    const emit = defineEmits<{ tag: [key: string] }>();

    const href = computed(() => openableUrl(props.entry.url));
</script>
