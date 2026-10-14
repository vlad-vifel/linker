<template>
    <AppDialog
        v-model:open="open"
        title="Rename storage"
        description="The file name on disk stays the same."
    >
        <form id="rename-storage" @submit.prevent="submit">
            <FormField v-model="name" label="Name" />
        </form>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <template #footer>
            <Button
                type="submit"
                form="rename-storage"
                class="flex-1"
                :disabled="!name.trim() || pending"
            >
                Save
            </Button>
        </template>
    </AppDialog>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';
    import AppDialog from '@/components/common/AppDialog.vue';
    import FormField from '@/components/common/FormField.vue';
    import { Button } from '@/components/ui/button';
    import { useAsyncAction } from '@/composables/useAsyncAction';
    import { useStorageActions } from '@/composables/useStorageActions';
    import type { StorageRef } from '@/types/storage';

    const props = defineProps<{ item: StorageRef }>();

    const open = defineModel<boolean>('open', { default: false });
    const actions = useStorageActions();
    const { pending, error, run } = useAsyncAction();
    const name = ref(props.item.name);

    watch(open, (value) => {
        if (value) name.value = props.item.name;
    });

    async function submit() {
        await run(() => actions.rename(props.item, name.value));
        if (!error.value) open.value = false;
    }
</script>
