<template>
    <div
        class="mx-auto flex h-dvh max-w-md flex-col items-center justify-center gap-8 px-4 pt-(--safe-top) pb-(--safe-bottom)"
    >
        <div class="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Link2 class="size-7" />
        </div>
        <PinCheck :check="lock.unlock" />
    </div>
</template>

<script setup lang="ts">
    import { Link2 } from 'lucide-vue-next';
    import { useLockStore } from '@/stores/lock';
    import PinCheck from './PinCheck.vue';

    const lock = useLockStore();
</script>
