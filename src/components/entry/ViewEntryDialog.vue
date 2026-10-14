<template>
    <AppDialog :open="Boolean(entry)" title="Entry" @update:open="onOpen">
        <EntryDetails v-if="entry" :entry="entry" @tag="showTag" />
        <template v-if="entry" #footer>
            <div class="flex w-full flex-col gap-2">
                <Button @click="dialogs.editEntry(entry.id)">
                    <Pencil />
                    Edit
                </Button>
                <Button v-if="existing" variant="outline" @click="goToPreset(existing)">
                    <ArrowUpRight />
                    Go to preset
                </Button>
                <Button v-else-if="draft" variant="outline" @click="dialogs.addPreset(draft)">
                    <Bookmark />
                    Save preset
                </Button>
                <Button variant="destructive" @click="confirmOpen = true">
                    <Trash2 />
                    Delete entry
                </Button>
            </div>
        </template>
    </AppDialog>
    <DeleteEntryDialog
        v-if="entry"
        v-model:open="confirmOpen"
        :entry="entry"
        @deleted="dialogs.closeView()"
    />
</template>

<script setup lang="ts">
    import { ArrowUpRight, Bookmark, Pencil, Trash2 } from 'lucide-vue-next';
    import { computed, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import AppDialog from '@/components/common/AppDialog.vue';
    import { draftFromEntry } from '@/components/presets/utils';
    import { Button } from '@/components/ui/button';
    import type { Preset } from '@/core/format';
    import { useDialogsStore } from '@/stores/dialogs';
    import { useEntriesStore } from '@/stores/entries';
    import { useFeedStore } from '@/stores/feed';
    import { useHighlightStore } from '@/stores/highlight';
    import { usePresetsStore } from '@/stores/presets';
    import DeleteEntryDialog from './DeleteEntryDialog.vue';
    import EntryDetails from './EntryDetails.vue';

    const router = useRouter();
    const dialogs = useDialogsStore();
    const entries = useEntriesStore();
    const feed = useFeedStore();
    const presets = usePresetsStore();
    const highlight = useHighlightStore();
    const confirmOpen = ref(false);

    const entry = computed(() =>
        dialogs.viewId ? (entries.byId.get(dialogs.viewId) ?? null) : null,
    );
    const draft = computed(() => (entry.value ? draftFromEntry(entry.value) : null));
    const existing = computed(() => {
        const error = draft.value && presets.error(draft.value);
        return error?.kind === 'combo' ? error.existing : null;
    });

    function onOpen(open: boolean) {
        if (!open) dialogs.closeView();
    }

    function showTag(tag: string) {
        feed.showTag(tag);
        dialogs.closeView();
        router.push('/links');
    }

    async function goToPreset(preset: Preset) {
        dialogs.closeView();
        await router.push('/presets');
        highlight.flash(preset.id);
    }
</script>
