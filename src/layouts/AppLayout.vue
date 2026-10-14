<template>
    <div class="relative mx-auto flex h-dvh max-w-2xl flex-col overflow-hidden pt-(--safe-top)">
        <main class="min-h-0 flex-1">
            <CenteredSpinner v-if="vault.status === 'loading' && !vault.data" />
            <StorageErrorScreen v-else-if="vault.status === 'error'" />
            <RouterView v-else v-slot="{ Component }">
                <KeepAlive include="LinksView">
                    <component :is="Component" />
                </KeepAlive>
            </RouterView>
        </main>
        <SaveErrorBar />
        <BottomNav />
        <ViewEntryDialog />
        <EditEntryDialog />
        <PresetDialog />
    </div>
</template>

<script setup lang="ts">
    import CenteredSpinner from '@/components/common/CenteredSpinner.vue';
    import EditEntryDialog from '@/components/entry/EditEntryDialog.vue';
    import ViewEntryDialog from '@/components/entry/ViewEntryDialog.vue';
    import BottomNav from '@/components/layout/BottomNav.vue';
    import PresetDialog from '@/components/presets/PresetDialog.vue';
    import SaveErrorBar from '@/components/layout/SaveErrorBar.vue';
    import StorageErrorScreen from '@/components/storage/StorageErrorScreen.vue';
    import { useVaultStore } from '@/stores/vault';

    const vault = useVaultStore();
</script>
