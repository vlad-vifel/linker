<template>
    <AppDialog
        v-model:open="open"
        title="Restore from backup"
        description="Pick a copy to replace the current file. The current file is kept as pre-restore."
    >
        <Spinner v-if="pending && !backups.length" class="mx-auto" />
        <div v-else-if="backups.length" class="flex flex-col gap-2">
            <BackupCard
                v-for="backup in backups"
                :key="backup.path"
                :stamp="backup.stamp"
                :selected="selected?.path === backup.path"
                @select="selected = backup"
            />
        </div>
        <p v-else class="text-sm text-muted-foreground">No backups yet</p>
        <Callout v-if="selected" variant="danger" :icon="TriangleAlert">
            Changes made after {{ displayStamp(selected.stamp) }} are replaced.
        </Callout>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <template #footer>
            <Button variant="outline" class="flex-1" @click="open = false">Cancel</Button>
            <Button
                variant="destructive"
                class="flex-1"
                :disabled="!selected || pending"
                @click="restore"
            >
                Restore
            </Button>
        </template>
    </AppDialog>
</template>

<script setup lang="ts">
    import { TriangleAlert } from 'lucide-vue-next';
    import { ref, watch } from 'vue';
    import { toast } from 'vue-sonner';
    import AppDialog from '@/components/common/AppDialog.vue';
    import Callout from '@/components/common/Callout.vue';
    import { Button } from '@/components/ui/button';
    import { Spinner } from '@/components/ui/spinner';
    import { displayStamp, storage, type BackupInfo } from '@/core/storage';
    import { useAsyncAction } from '@/composables/useAsyncAction';
    import { useStorageActions } from '@/composables/useStorageActions';
    import type { StorageRef } from '@/types/storage';
    import BackupCard from './BackupCard.vue';

    const props = defineProps<{ item: StorageRef }>();

    const open = defineModel<boolean>('open', { default: false });
    const actions = useStorageActions();
    const { pending, error, run } = useAsyncAction();
    const backups = ref<BackupInfo[]>([]);
    const selected = ref<BackupInfo | null>(null);

    watch(open, async (value) => {
        if (!value) return;
        selected.value = null;
        backups.value = (await run(() => storage.backups(props.item.path))) ?? [];
    });

    async function restore() {
        const backup = selected.value;
        if (!backup) return;
        await run(() => actions.restore(props.item, backup.path));
        if (error.value) return;
        open.value = false;
        toast.success(`Restored ${displayStamp(backup.stamp)}`);
    }
</script>
