<template>
    <div class="flex h-full flex-col">
        <div class="min-h-0 flex-1 overflow-y-auto">
            <PageHeader title="Presets" />
            <div class="flex flex-col gap-4 px-4 pb-6">
                <div class="flex gap-2">
                    <Button class="flex-1" :disabled="editing" @click="dialogs.addPreset()">
                        <Plus />
                        Add preset
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        :aria-label="editing ? 'Cancel editing' : 'Edit order'"
                        :disabled="!editing && presets.presets.length < 2"
                        @click="toggleEditing"
                    >
                        <X v-if="editing" />
                        <Pencil v-else />
                    </Button>
                </div>
                <div v-if="list.length" ref="container" class="flex flex-col gap-3">
                    <PresetCard
                        v-for="preset in list"
                        :key="preset.id"
                        :preset="preset"
                        :editing="editing"
                        @open="open(preset)"
                        @delete="removing = preset"
                    />
                </div>
                <EmptyState
                    v-else
                    :icon="Bookmark"
                    title="No presets yet"
                    description="Save tag and favorite filters for quick access"
                />
            </div>
        </div>
        <div v-if="editing" class="shrink-0 border-t border-border/50 bg-background p-4">
            <Button class="w-full" @click="save">Save</Button>
        </div>
        <DeletePresetDialog
            v-if="removing"
            :open="true"
            :preset="removing"
            @update:open="removing = null"
        />
    </div>
</template>

<script setup lang="ts">
    import { Bookmark, Pencil, Plus, X } from 'lucide-vue-next';
    import { computed, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import EmptyState from '@/components/common/EmptyState.vue';
    import PageHeader from '@/components/layout/PageHeader.vue';
    import DeletePresetDialog from '@/components/presets/DeletePresetDialog.vue';
    import PresetCard from '@/components/presets/PresetCard.vue';
    import { Button } from '@/components/ui/button';
    import { useDragReorder } from '@/composables/useDragReorder';
    import type { Preset } from '@/core/format';
    import { useDialogsStore } from '@/stores/dialogs';
    import { useFeedStore } from '@/stores/feed';
    import { usePresetsStore } from '@/stores/presets';

    const router = useRouter();
    const dialogs = useDialogsStore();
    const feed = useFeedStore();
    const presets = usePresetsStore();
    const removing = ref<Preset | null>(null);
    const editing = ref(false);
    const draft = ref<Preset[]>([]);
    const container = ref<HTMLElement | null>(null);
    useDragReorder(draft, container, editing);

    const list = computed(() => (editing.value ? draft.value : presets.presets));

    function toggleEditing() {
        draft.value = [...presets.presets];
        editing.value = !editing.value;
    }

    function save() {
        presets.reorder(draft.value.map((preset) => preset.id));
        editing.value = false;
    }

    function open(preset: Preset) {
        feed.showPreset(preset);
        router.push('/links');
    }
</script>
