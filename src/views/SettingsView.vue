<template>
    <div class="h-full overflow-y-auto">
        <PageHeader title="Settings" />
        <div class="flex flex-col gap-3 px-4 pb-6">
            <StoragesSection />
            <template v-if="vault.data">
                <BackupSection />
                <TagsSection />
            </template>
            <SecuritySection />
            <AboutSection />
        </div>
    </div>
</template>

<script setup lang="ts">
    import PageHeader from '@/components/layout/PageHeader.vue';
    import AboutSection from '@/components/settings/AboutSection.vue';
    import BackupSection from '@/components/settings/BackupSection.vue';
    import StoragesSection from '@/components/settings/StoragesSection.vue';
    import SecuritySection from '@/components/settings/SecuritySection.vue';
    import TagsSection from '@/components/settings/TagsSection.vue';
    import { useVaultStore } from '@/stores/vault';

    const vault = useVaultStore();
</script>
