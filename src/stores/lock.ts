import { useIntervalFn, useNow } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
    createPinRecord,
    isPinRecord,
    nextAttempts,
    type PinAttempts,
    type PinRecord,
    verifyPin,
} from '@/core/security';
import { readJson, writeJson } from '@/lib/localStore';

const PIN_KEY = 'linker.pin';
const ATTEMPTS_KEY = 'linker.pinAttempts';

function readRecord() {
    const value = readJson<unknown>(PIN_KEY, null);
    return isPinRecord(value) ? value : null;
}

export const useLockStore = defineStore('lock', () => {
    const record = ref<PinRecord | null>(readRecord());
    const attempts = ref<PinAttempts>(readJson(ATTEMPTS_KEY, { failed: 0, until: 0 }));
    const locked = ref(record.value !== null);
    const now = useNow({ scheduler: (callback) => useIntervalFn(callback, 1000) });

    const hasPin = computed(() => record.value !== null);
    const waitSeconds = computed(() =>
        Math.max(0, Math.ceil((attempts.value.until - now.value.getTime()) / 1000)),
    );

    async function check(pin: string) {
        if (!record.value) return true;
        if (Date.now() < attempts.value.until) return false;
        const ok = await verifyPin(pin, record.value);
        attempts.value = nextAttempts(attempts.value, ok);
        writeJson(ATTEMPTS_KEY, attempts.value);
        return ok;
    }

    async function unlock(pin: string) {
        const ok = await check(pin);
        if (ok) locked.value = false;
        return ok;
    }

    async function setPin(pin: string) {
        record.value = await createPinRecord(pin);
        writeJson(PIN_KEY, record.value);
    }

    async function removePin(pin: string) {
        if (!(await check(pin))) return false;
        record.value = null;
        writeJson(PIN_KEY, null);
        return true;
    }

    return { hasPin, locked, waitSeconds, unlock, setPin, removePin };
});
