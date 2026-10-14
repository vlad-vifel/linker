<template>
    <form :id="formId" class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <div class="flex flex-col gap-2">
            <Label for="preset-name">Name</Label>
            <div class="flex items-center gap-2">
                <Input
                    id="preset-name"
                    v-model="name"
                    autocomplete="off"
                    placeholder="Optional"
                    class="flex-1"
                />
                <FavoriteButton :active="favorite" @toggle="favorite = !favorite" />
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <Label>Tags</Label>
            <TagMultiSelect v-model="tags" no-tag creatable placeholder="Select tags" />
        </div>
        <p v-if="message" class="text-sm text-destructive">{{ message }}</p>
        <Button
            v-if="error?.kind === 'combo' && error.existing"
            type="button"
            variant="outline"
            @click="dialogs.editPreset(error.existing.id)"
        >
            Open existing
        </Button>
    </form>
</template>

<script setup lang="ts">
    import { computed, ref, useId } from 'vue';
    import FavoriteButton from '@/components/entry/FavoriteButton.vue';
    import TagMultiSelect from '@/components/tags/TagMultiSelect.vue';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import type { Preset, PresetDraft } from '@/core/format';
    import { useDialogsStore } from '@/stores/dialogs';
    import { usePresetsStore } from '@/stores/presets';
    import { PRESET_ERRORS } from './const';

    const props = defineProps<{ preset?: Preset; initial?: PresetDraft }>();
    const emit = defineEmits<{ submit: [draft: PresetDraft] }>();

    const formId = useId();
    const dialogs = useDialogsStore();
    const presets = usePresetsStore();
    const source = props.preset ?? props.initial;
    const name = ref(source?.name ?? '');
    const tags = ref([...(source?.tags ?? [])]);
    const favorite = ref(source?.favorite ?? false);

    const draft = computed<PresetDraft>(() => ({
        name: name.value.trim() || null,
        tags: tags.value,
        favorite: favorite.value,
    }));
    const error = computed(() => presets.error(draft.value, props.preset?.id));
    const message = computed(() =>
        error.value && error.value.kind !== 'empty' ? PRESET_ERRORS[error.value.kind] : null,
    );

    defineExpose({ formId, invalid: computed(() => Boolean(error.value)) });

    function submit() {
        if (!error.value) emit('submit', draft.value);
    }
</script>
