<template>
    <SettingsSection title="Backup" description="Daily copy, 14 days kept">
        <div class="flex flex-col gap-3">
            <p class="text-sm">
                Last backup:
                <span class="text-muted-foreground">{{
                    vault.lastBackup ? displayStamp(vault.lastBackup) : 'none yet'
                }}</span>
            </p>
            <Button v-if="storages.active" variant="outline" @click="backupOpen = true">
                <Archive />
                Make backup
            </Button>
            <Button v-if="storages.active" variant="outline" @click="restoreOpen = true">
                <History />
                Restore from backup
            </Button>
            <MakeBackupDialog
                v-if="storages.active"
                v-model:open="backupOpen"
                :item="storages.active"
            />
            <RestoreBackupDialog
                v-if="storages.active"
                v-model:open="restoreOpen"
                :item="storages.active"
            />
        </div>
    </SettingsSection>
</template>

<script setup lang="ts">
    import { Archive, History } from 'lucide-vue-next';
    import { ref } from 'vue';
    import MakeBackupDialog from '@/components/storage/MakeBackupDialog.vue';
    import RestoreBackupDialog from '@/components/storage/RestoreBackupDialog.vue';
    import { Button } from '@/components/ui/button';
    import { displayStamp } from '@/core/storage';
    import { useStoragesStore } from '@/stores/storages';
    import { useVaultStore } from '@/stores/vault';
    import SettingsSection from './SettingsSection.vue';

    const storages = useStoragesStore();
    const vault = useVaultStore();
    const backupOpen = ref(false);
    const restoreOpen = ref(false);
</script>
