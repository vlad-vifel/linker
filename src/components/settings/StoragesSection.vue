<template>
    <SettingsSection title="Storages" description="Tap a storage to make it active" default-open>
        <div class="flex flex-col gap-2">
            <StorageCard v-for="item in storages.list" :key="item.id" :item="item" />
            <Button variant="outline" @click="addOpen = true">
                <Plus />
                Add storage
            </Button>
        </div>
        <AppDialog v-model:open="addOpen" title="Add storage">
            <AddStorageForms ref="forms" allow-merge @done="addOpen = false" />
            <template v-if="forms?.ready" #footer>
                <AddStorageSubmit :forms="forms" />
            </template>
        </AppDialog>
    </SettingsSection>
</template>

<script setup lang="ts">
    import { Plus } from 'lucide-vue-next';
    import { ref } from 'vue';
    import AppDialog from '@/components/common/AppDialog.vue';
    import AddStorageForms from '@/components/storage/AddStorageForms.vue';
    import AddStorageSubmit from '@/components/storage/AddStorageSubmit.vue';
    import { Button } from '@/components/ui/button';
    import { useStoragesStore } from '@/stores/storages';
    import SettingsSection from './SettingsSection.vue';
    import StorageCard from './StorageCard.vue';

    const storages = useStoragesStore();
    const addOpen = ref(false);
    const forms = ref<InstanceType<typeof AddStorageForms> | null>(null);
</script>
