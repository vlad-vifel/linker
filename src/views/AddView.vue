<template>
    <div class="flex h-full flex-col">
        <div class="min-h-0 flex-1 overflow-y-auto">
            <PageHeader title="Add" />
            <div class="px-4 pb-6">
                <EntryForm ref="form" @submit="save" />
            </div>
        </div>
        <div class="border-t border-border/50 p-4">
            <EntryFormFooter :form="form" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { toast } from 'vue-sonner';
    import EntryForm from '@/components/entry/EntryForm.vue';
    import type { EntrySubmit } from '@/components/entry/types';
    import EntryFormFooter from '@/components/entry/EntryFormFooter.vue';
    import PageHeader from '@/components/layout/PageHeader.vue';
    import { useEntriesStore } from '@/stores/entries';

    const entries = useEntriesStore();
    const form = ref<InstanceType<typeof EntryForm> | null>(null);

    function save({ draft, replaceId }: EntrySubmit) {
        entries.add(draft, replaceId);
        form.value?.reset();
        toast.success('Saved');
    }
</script>
