<template>
    <div v-if="item" class="flex h-full flex-col gap-4 overflow-y-auto p-4">
        <Callout
            variant="danger"
            class="flex-col items-center rounded-xl p-6 text-center text-base text-foreground"
        >
            <FileWarning class="size-8 text-destructive" />
            <p class="font-medium">{{ item.name }}: {{ vault.loadError?.message }}</p>
            <p class="text-xs break-all text-muted-foreground">{{ displayPath(item.path) }}</p>
            <p v-if="invalid" class="text-xs text-muted-foreground">
                The file is kept as is and will not be overwritten.
            </p>
        </Callout>
        <Button variant="outline" @click="vault.open()">
            <RefreshCw />
            Try again
        </Button>
        <form v-if="!newer" class="flex flex-col gap-2" @submit.prevent="locate">
            <PathField v-model="path" kind="file" label="Locate file" placeholder="Path to file" />
            <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
            <Button type="submit" variant="secondary" :disabled="!path.trim() || pending">
                Use this file
            </Button>
        </form>
        <Button v-if="!newer" variant="secondary" @click="restoreOpen = true">
            <History />
            Restore from backup
        </Button>
        <Button variant="destructive" @click="removeOpen = true">Remove from list</Button>
        <StorageSwitcher />
        <RestoreBackupDialog v-model:open="restoreOpen" :item="item" />
        <RemoveStorageDialog v-model:open="removeOpen" :item="item" />
    </div>
</template>

<script setup lang="ts">
    import { FileWarning, History, RefreshCw } from 'lucide-vue-next';
    import { computed, ref, watch } from 'vue';
    import Callout from '@/components/common/Callout.vue';
    import { Button } from '@/components/ui/button';
    import { useAsyncAction } from '@/composables/useAsyncAction';
    import { useStorageActions } from '@/composables/useStorageActions';
    import { displayPath } from '@/core/storage';
    import { useStoragesStore } from '@/stores/storages';
    import { useVaultStore } from '@/stores/vault';
    import PathField from './PathField.vue';
    import RemoveStorageDialog from './RemoveStorageDialog.vue';
    import RestoreBackupDialog from './RestoreBackupDialog.vue';
    import StorageSwitcher from './StorageSwitcher.vue';

    const storages = useStoragesStore();
    const vault = useVaultStore();
    const actions = useStorageActions();
    const { pending, error, run } = useAsyncAction();
    const path = ref('');
    const restoreOpen = ref(false);
    const removeOpen = ref(false);
    const item = ref(storages.active);

    const invalid = computed(() => vault.loadError?.code === 'invalid');
    const newer = computed(() => vault.loadError?.code === 'newer-version');

    watch(
        () => storages.active,
        (value) => (item.value = value),
    );

    async function locate() {
        if (item.value) await run(() => actions.locate(item.value!, path.value));
    }
</script>
