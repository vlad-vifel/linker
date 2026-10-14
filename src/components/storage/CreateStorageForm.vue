<template>
    <form class="flex flex-col gap-4" @submit.prevent="submit">
        <FormField v-model="name" label="Name" placeholder="Storage name" />
        <PathField
            v-model="folder"
            kind="folder"
            label="Folder"
            placeholder="Path to folder"
            :hint="target ? `File: ${target}` : undefined"
        />
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    </form>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { FILE_EXTENSION } from '@/core/format';
    import { resolveFilePath } from '@/core/storage';
    import { useAsyncAction } from '@/composables/useAsyncAction';
    import { useStorageActions } from '@/composables/useStorageActions';
    import FormField from '@/components/common/FormField.vue';
    import PathField from './PathField.vue';

    const emit = defineEmits<{ done: [] }>();

    const actions = useStorageActions();
    const { pending, error, run } = useAsyncAction();
    const name = ref('');
    const folder = ref('');

    const target = computed(() =>
        name.value.trim() && folder.value.trim()
            ? resolveFilePath(folder.value, name.value, FILE_EXTENSION)
            : null,
    );

    defineExpose({
        canSubmit: computed(() => Boolean(target.value) && !pending.value),
        pending,
        submitText: 'Create storage',
        submit,
    });

    async function submit() {
        const created = await run(async () => {
            await actions.create(name.value, folder.value);
            return true;
        });
        if (created) emit('done');
    }
</script>
