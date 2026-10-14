<template>
    <div class="flex flex-col items-center gap-6">
        <p class="text-sm">Enter PIN</p>
        <PinPad
            v-model="pin"
            :disabled="pending || lock.waitSeconds > 0"
            :error="Boolean(message)"
            @complete="onComplete"
        />
        <p class="h-6 text-sm text-destructive">{{ message }}</p>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import { useLockStore } from '@/stores/lock';
    import { PIN_MESSAGES } from './const';
    import PinPad from './PinPad.vue';

    const props = defineProps<{ check: (pin: string) => Promise<boolean> }>();

    const lock = useLockStore();
    const pin = ref('');
    const pending = ref(false);
    const wrong = ref(false);

    watch(pin, (value) => {
        if (value) wrong.value = false;
    });

    const message = computed(() => {
        if (lock.waitSeconds > 0) return `Too many attempts. Try again in ${lock.waitSeconds} s`;
        return wrong.value ? PIN_MESSAGES.wrong : null;
    });

    async function onComplete(value: string) {
        pending.value = true;
        wrong.value = !(await props.check(value));
        pending.value = false;
        pin.value = '';
    }
</script>
