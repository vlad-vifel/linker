<template>
    <Button
        v-if="forms?.ready"
        type="button"
        class="w-full"
        :disabled="!forms.canSubmit"
        @click="forms.submit()"
    >
        <Spinner v-if="forms.pending" />
        {{ forms.submitText }}
    </Button>
</template>

<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { Spinner } from '@/components/ui/spinner';
    import type AddStorageForms from './AddStorageForms.vue';

    defineProps<{ forms: InstanceType<typeof AddStorageForms> | null }>();
</script>
