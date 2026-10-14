<template>
    <AppDialog v-model:open="open" title="Remove PIN" description="Enter the current PIN.">
        <PinCheck v-if="open" class="py-4" :check="remove" />
    </AppDialog>
</template>

<script setup lang="ts">
    import { toast } from 'vue-sonner';
    import AppDialog from '@/components/common/AppDialog.vue';
    import { useLockStore } from '@/stores/lock';
    import PinCheck from './PinCheck.vue';

    const open = defineModel<boolean>('open', { default: false });
    const lock = useLockStore();

    async function remove(pin: string) {
        const ok = await lock.removePin(pin);
        if (ok) {
            open.value = false;
            toast.success('PIN removed');
        }
        return ok;
    }
</script>
