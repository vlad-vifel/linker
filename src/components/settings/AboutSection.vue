<template>
    <SettingsSection title="About">
        <p class="text-sm text-muted-foreground">Linker v{{ version }}</p>
    </SettingsSection>
</template>

<script setup lang="ts">
    import SettingsSection from './SettingsSection.vue';

    const version = __APP_VERSION__;
</script>
