<template>
    <div class="flex flex-col gap-3">
        <Callout variant="warning" :icon="ShieldAlert">
            <p>
                Linker keeps your data in a file on this device. Allow access to files so it can
                read and write that file and its backups. Nothing is sent anywhere.
            </p>
        </Callout>
        <Button type="button" @click="request">
            <FolderLock />
            Allow file access
        </Button>
    </div>
</template>

<script setup lang="ts">
    import { FolderLock, ShieldAlert } from 'lucide-vue-next';
    import Callout from '@/components/common/Callout.vue';
    import { Button } from '@/components/ui/button';
    import { useFilesAccess } from '@/composables/useFilesAccess';

    const { request } = useFilesAccess();
</script>
