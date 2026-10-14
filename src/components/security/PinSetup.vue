<template>
    <div class="flex flex-col items-center gap-6">
        <p class="text-sm">{{ first === null ? 'Enter a 4-digit PIN' : 'Repeat the PIN' }}</p>
        <PinPad v-model="pin" :error="Boolean(error)" @complete="onComplete" />
        <p class="h-6 text-sm text-destructive">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { PIN_MESSAGES } from './const';
    import PinPad from './PinPad.vue';

    const emit = defineEmits<{ done: [pin: string] }>();

    const pin = ref('');
    const first = ref<string | null>(null);
    const error = ref<string | null>(null);

    watch(pin, (value) => {
        if (value) error.value = null;
    });

    function onComplete(value: string) {
        pin.value = '';
        if (first.value === null) {
            first.value = value;
            error.value = null;
        } else if (value === first.value) {
            emit('done', value);
        } else {
            first.value = null;
            error.value = PIN_MESSAGES.mismatch;
        }
    }
</script>
