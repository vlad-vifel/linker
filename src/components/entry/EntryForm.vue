<template>
    <form :id="formId" class="flex flex-col gap-4" novalidate @submit.prevent="submit()">
        <div class="flex flex-col gap-2">
            <Label for="entry-url">URL</Label>
            <div class="flex items-center gap-2">
                <Input
                    id="entry-url"
                    v-model="form.url"
                    type="url"
                    inputmode="url"
                    autocomplete="off"
                    placeholder="https://"
                    class="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Paste"
                    @click="paste"
                >
                    <ClipboardPaste />
                </Button>
                <FavoriteButton :active="form.favorite" @toggle="form.favorite = !form.favorite" />
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <Label>Tags</Label>
            <TagMultiSelect v-model="form.tags" placeholder="Select tags" creatable />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="entry-note">Note</Label>
            <Textarea id="entry-note" v-model="form.note" placeholder="Optional" />
        </div>
        <p v-if="!valid && touched" class="text-sm text-destructive">Add a URL or a note</p>
        <DuplicateWarning v-if="duplicate" :entry="duplicate" />
    </form>
</template>

<script setup lang="ts">
    import { refDebounced } from '@vueuse/core';
    import { ClipboardPaste } from 'lucide-vue-next';
    import { computed, ref, useId } from 'vue';
    import { toast } from 'vue-sonner';
    import { type Entry, isEntryValid, normalizeUrlInput } from '@/core/format';
    import TagMultiSelect from '@/components/tags/TagMultiSelect.vue';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { readClipboard } from '@/lib/clipboard';
    import { useEntriesStore } from '@/stores/entries';
    import DuplicateWarning from './DuplicateWarning.vue';
    import FavoriteButton from './FavoriteButton.vue';
    import type { EntrySubmit } from './types';
    import { draftFromForm, emptyForm, formFromEntry } from './utils';

    const props = defineProps<{ entry?: Entry }>();
    const emit = defineEmits<{ submit: [payload: EntrySubmit] }>();

    const formId = useId();
    const entries = useEntriesStore();
    const form = ref(props.entry ? formFromEntry(props.entry) : emptyForm());
    const touched = ref(false);
    const url = refDebounced(
        computed(() => form.value.url),
        200,
    );

    const valid = computed(() => isEntryValid(draftFromForm(form.value)));
    const duplicate = computed(() =>
        form.value.url.trim()
            ? entries.findDuplicate(normalizeUrlInput(url.value) || null, props.entry?.id)
            : null,
    );

    function submit(replaceId?: string) {
        touched.value = true;
        if (!valid.value) return;
        const draft = draftFromForm(form.value);
        if (!replaceId && entries.findDuplicate(draft.url, props.entry?.id)) return;
        emit('submit', { draft, replaceId });
    }

    async function paste() {
        try {
            form.value.url = (await readClipboard()).trim();
        } catch {
            toast.error('Could not read clipboard');
        }
    }

    function reset() {
        form.value = emptyForm();
        touched.value = false;
    }

    defineExpose({ reset, submit, formId, duplicate });
</script>
