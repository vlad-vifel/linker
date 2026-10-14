<template>
    <LockScreen v-if="lock.locked" />
    <RouterView v-else />
    <Toaster
        theme="dark"
        position="bottom-center"
        :duration="2500"
        :offset="TOAST_OFFSET"
        :mobile-offset="TOAST_OFFSET"
    />
</template>

<script setup lang="ts">
    import { useEventListener } from '@vueuse/core';
    import { watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { Toaster } from 'vue-sonner';
    import LockScreen from '@/components/security/LockScreen.vue';
    import { useNativeBack } from '@/composables/useNativeBack';
    import { useFeedStore } from '@/stores/feed';
    import { useLockStore } from '@/stores/lock';
    import { useStoragesStore } from '@/stores/storages';
    import { useVaultStore } from '@/stores/vault';

    const TOAST_OFFSET = {
        bottom: 'calc(var(--safe-bottom) + var(--bottom-nav-h) + 1rem)',
        left: '1rem',
        right: '1rem',
    };

    const storages = useStoragesStore();
    const vault = useVaultStore();
    const lock = useLockStore();
    const feed = useFeedStore();
    const router = useRouter();
    useNativeBack();

    watch(
        () => storages.active?.id,
        () => {
            feed.clear();
            vault.open();
        },
        { immediate: true },
    );

    watch(
        () => storages.list.length,
        (count) => {
            if (!count) router.replace('/welcome');
        },
    );

    useEventListener(document, 'visibilitychange', () => {
        if (document.visibilityState === 'visible') vault.checkExternalChange();
        else vault.save();
    });
    useEventListener(window, 'focus', () => vault.checkExternalChange());
    useEventListener(window, 'beforeunload', (event) => {
        if (!vault.hasUnsaved()) return;
        vault.save();
        event.preventDefault();
    });
</script>
