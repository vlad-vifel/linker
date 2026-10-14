<template>
    <div v-if="duplicate" class="flex w-full gap-2">
        <Button
            type="button"
            variant="outline"
            class="flex-1"
            @click="dialogs.viewEntry(duplicate.id)"
        >
            Open existing
        </Button>
        <Button type="button" class="flex-1" @click="form?.submit(duplicate.id)">
            Save anyway
        </Button>
    </div>
    <Button v-else type="submit" class="w-full" :form="form?.formId">Save</Button>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { Button } from '@/components/ui/button';
    import { useDialogsStore } from '@/stores/dialogs';
    import type EntryForm from './EntryForm.vue';

    const props = defineProps<{ form: InstanceType<typeof EntryForm> | null }>();

    const dialogs = useDialogsStore();
    const duplicate = computed(() => props.form?.duplicate ?? null);
</script>
