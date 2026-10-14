<template>
    <form :id="formId" class="flex flex-col gap-4" @submit.prevent="emit('submit')">
        <div v-if="key !== undefined" class="flex flex-col gap-2">
            <FormField v-model="key" label="Key" placeholder="Tag key" />
            <p v-if="keyError" class="text-sm text-destructive">{{ keyError }}</p>
            <Callout v-else-if="mergeInto" variant="warning" :icon="Merge">
                Tag "{{ mergeInto }}" exists. Entries will be moved to it and this tag removed.
            </Callout>
        </div>
        <FormField v-model="label" label="Label" placeholder="Shown instead of the key" />
    </form>
</template>

<script setup lang="ts">
    import { Merge } from 'lucide-vue-next';
    import Callout from '@/components/common/Callout.vue';
    import FormField from '@/components/common/FormField.vue';

    defineProps<{ formId: string; keyError?: string | null; mergeInto?: string | null }>();
    const emit = defineEmits<{ submit: [] }>();

    const key = defineModel<string | undefined>('tagKey', { default: undefined });
    const label = defineModel<string>('label', { required: true });
</script>
