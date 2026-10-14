<template>
    <ListCard
        ref="card"
        :class="[
            highlight.isActive(preset.id) && 'duration-500',
            highlight.isLit(preset.id) && 'border-foreground/50 bg-input/80',
        ]"
        @select="!editing && emit('open')"
    >
        <p v-if="preset.name" class="mb-1 truncate text-sm font-medium">{{ preset.name }}</p>
        <TagChips :keys="preset.tags" class="items-center" />
        <template #actions>
            <Star
                v-if="preset.favorite"
                class="size-4 shrink-0 fill-warning text-warning"
                aria-label="Favorite"
            />
            <button
                v-if="editing"
                type="button"
                aria-label="Drag to reorder"
                data-drag-handle
                class="flex size-8 shrink-0 touch-none items-center justify-center text-muted-foreground"
            >
                <GripVertical class="size-5" />
            </button>
            <PresetMenu v-else :preset="preset" @delete="emit('delete')" />
        </template>
    </ListCard>
</template>

<script setup lang="ts">
    import { GripVertical, Star } from 'lucide-vue-next';
    import { nextTick, onMounted, ref } from 'vue';
    import ListCard from '@/components/common/ListCard.vue';
    import TagChips from '@/components/tags/TagChips.vue';
    import type { Preset } from '@/core/format';
    import { useHighlightStore } from '@/stores/highlight';
    import PresetMenu from './PresetMenu.vue';

    const props = defineProps<{ preset: Preset; editing?: boolean }>();
    const emit = defineEmits<{ open: []; delete: [] }>();

    const highlight = useHighlightStore();
    const card = ref<InstanceType<typeof ListCard> | null>(null);

    onMounted(async () => {
        if (highlight.id !== props.preset.id) return;
        await nextTick();
        card.value?.$el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
</script>
