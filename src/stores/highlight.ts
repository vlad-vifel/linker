import { defineStore } from 'pinia';
import { ref } from 'vue';

const FADE = 500;
const HOLD = 3000;

export const useHighlightStore = defineStore('highlight', () => {
    const id = ref<string | null>(null);
    const lit = ref(false);
    let timers: ReturnType<typeof setTimeout>[] = [];

    function flash(target: string) {
        timers.forEach(clearTimeout);
        id.value = target;
        lit.value = true;
        timers = [
            setTimeout(() => (lit.value = false), FADE + HOLD),
            setTimeout(() => (id.value = null), FADE + HOLD + FADE),
        ];
    }

    function isLit(target: string) {
        return id.value === target && lit.value;
    }

    function isActive(target: string) {
        return id.value === target;
    }

    return { id, lit, flash, isLit, isActive };
});
