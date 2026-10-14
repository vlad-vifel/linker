<template>
    <form class="flex flex-col gap-4" @submit.prevent="submit">
        <PathField v-model="path" kind="file" label="File" placeholder="Path to file" />
        <Spinner v-if="pending && !file" class="mx-auto" />
        <template v-if="file">
            <p class="rounded-md bg-muted/50 px-3 py-2 text-sm">
                {{ file.store.name || 'Unnamed' }} · {{ formatCount(file.store.links.length) }} ·
                {{ Object.keys(file.store.tags).length }} tags
            </p>
            <ImportModePicker v-if="allowMerge" v-model:mode="mode" v-model:target="targetId" />
            <FormField
                v-if="mode === 'use' && !file.store.name"
                v-model="name"
                label="Name"
                placeholder="Storage name"
            />
            <p v-if="mode === 'merge' && summary" class="text-sm text-muted-foreground">
                {{ summary.added }} new · {{ summary.replaced }} replaced ·
                {{ summary.skipped }} skipped
            </p>
        </template>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    </form>
</template>

<script setup lang="ts">
    import { watchDebounced } from '@vueuse/core';
    import { computed, ref, watch } from 'vue';
    import { toast } from 'vue-sonner';
    import { FILE_EXTENSION } from '@/core/format';
    import { StorageError } from '@/core/storage';
    import { formatCount } from '@/lib/format';
    import { Spinner } from '@/components/ui/spinner';
    import { useAsyncAction } from '@/composables/useAsyncAction';
    import type { InspectedFile } from '@/composables/types';
    import { useStorageActions } from '@/composables/useStorageActions';
    import { useStoragesStore } from '@/stores/storages';
    import { INSPECT_DELAY } from './const';
    import FormField from '@/components/common/FormField.vue';
    import ImportModePicker from './ImportModePicker.vue';
    import PathField from './PathField.vue';
    import type { ImportMode, MergeSummary } from './types';

    defineProps<{ allowMerge?: boolean }>();
    const emit = defineEmits<{ done: [] }>();

    const actions = useStorageActions();
    const storages = useStoragesStore();
    const { pending, error, run } = useAsyncAction();
    const path = ref('');
    const name = ref('');
    const file = ref<InspectedFile | null>(null);
    const mode = ref<ImportMode>('use');
    const targetId = ref(storages.active?.id ?? '');
    const summary = ref<MergeSummary | null>(null);

    const target = computed(() => storages.list.find((item) => item.id === targetId.value) ?? null);
    const canSubmit = computed(() => {
        if (!file.value || pending.value) return false;
        if (mode.value === 'merge') return Boolean(target.value && summary.value);
        return Boolean(file.value.store.name || name.value.trim());
    });
    const submitText = computed(() => (mode.value === 'merge' ? 'Merge' : 'Use as storage'));

    watch(path, () => {
        file.value = null;
        error.value = null;
    });
    watchDebounced(
        path,
        async (value) => {
            if (!value.trim()) return;
            if (!value.trim().toLowerCase().endsWith(FILE_EXTENSION)) {
                error.value = new StorageError('BAD_EXTENSION').message;
                return;
            }
            const inspected = (await run(() => actions.inspect(value))) ?? null;
            if (value === path.value) file.value = inspected;
            else error.value = null;
        },
        { debounce: INSPECT_DELAY },
    );
    watch([file, mode, target], async () => {
        summary.value = null;
        if (!file.value || mode.value !== 'merge' || !target.value) return;
        summary.value = (await run(() => actions.previewMerge(file.value!, target.value!))) ?? null;
    });

    defineExpose({ canSubmit, pending, submitText, submit });

    async function submit() {
        if (!file.value) return;
        const inspected = file.value;
        const done = await run(async () => {
            if (mode.value === 'merge' && target.value) {
                await actions.mergeInto(inspected, target.value);
                toast.success(`Merged into ${target.value.name}`);
            } else {
                await actions.useAsStorage(inspected, name.value);
            }
            return true;
        });
        if (done) emit('done');
    }
</script>
