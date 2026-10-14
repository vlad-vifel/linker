<template>
    <SettingsSection title="PIN" :description="lock.hasPin ? 'On' : 'Off'">
        <Button v-if="lock.hasPin" variant="destructive" class="w-full" @click="removeOpen = true">
            <LockOpen />
            Remove PIN
        </Button>
        <Button v-else variant="outline" class="w-full" @click="setOpen = true">
            <LockKeyhole />
            Set PIN
        </Button>
        <SetPinDialog v-model:open="setOpen" />
        <RemovePinDialog v-model:open="removeOpen" />
    </SettingsSection>
</template>

<script setup lang="ts">
    import { LockKeyhole, LockOpen } from 'lucide-vue-next';
    import { ref } from 'vue';
    import RemovePinDialog from '@/components/security/RemovePinDialog.vue';
    import SetPinDialog from '@/components/security/SetPinDialog.vue';
    import { Button } from '@/components/ui/button';
    import { useLockStore } from '@/stores/lock';
    import SettingsSection from './SettingsSection.vue';

    const lock = useLockStore();
    const setOpen = ref(false);
    const removeOpen = ref(false);
</script>
