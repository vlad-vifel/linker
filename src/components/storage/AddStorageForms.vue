<template>
    <FilesAccessCallout v-if="!granted" />
    <div v-else class="flex flex-col gap-4">
        <SegmentedControl v-model="tab" :options="ADD_TABS" />
        <CreateStorageForm v-if="tab === 'create'" ref="form" @done="emit('done')" />
        <ImportStorageForm v-else ref="form" :allow-merge="allowMerge" @done="emit('done')" />
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import SegmentedControl from '@/components/common/SegmentedControl.vue';
    import { useFilesAccess } from '@/composables/useFilesAccess';
    import { ADD_TABS } from './const';
    import CreateStorageForm from './CreateStorageForm.vue';
    import FilesAccessCallout from './FilesAccessCallout.vue';
    import ImportStorageForm from './ImportStorageForm.vue';
    import type { AddTab, StorageFormHandle } from './types';

    defineProps<{ allowMerge?: boolean }>();
    const emit = defineEmits<{ done: [] }>();

    const { granted } = useFilesAccess();
    const tab = ref<AddTab>('create');
    const form = ref<StorageFormHandle | null>(null);

    defineExpose({
        ready: granted,
        canSubmit: computed(() => form.value?.canSubmit ?? false),
        pending: computed(() => form.value?.pending ?? false),
        submitText: computed(() => form.value?.submitText ?? ''),
        submit: () => form.value?.submit(),
    });
</script>
