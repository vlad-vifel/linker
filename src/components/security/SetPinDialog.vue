<template>
    <AppDialog v-model:open="open" title="Set PIN" description="Set a PIN to open the app.">
        <PinSetup v-if="open" class="py-4" @done="save" />
    </AppDialog>
</template>

<script setup lang="ts">
    import { toast } from 'vue-sonner';
    import AppDialog from '@/components/common/AppDialog.vue';
    import { useLockStore } from '@/stores/lock';
    import PinSetup from './PinSetup.vue';

    const open = defineModel<boolean>('open', { default: false });
    const lock = useLockStore();

    async function save(pin: string) {
        await lock.setPin(pin);
        open.value = false;
        toast.success('PIN set');
    }
</script>
