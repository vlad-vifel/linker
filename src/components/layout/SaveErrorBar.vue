<template>
    <div
        v-if="vault.saveError"
        class="flex shrink-0 items-center gap-2 border-t border-destructive/30 bg-destructive/15 px-4 py-2 text-sm text-destructive"
    >
        <TriangleAlert class="size-4 shrink-0" />
        <span class="min-w-0 flex-1 truncate">
            {{ vault.conflict ? vault.saveError : `Not saved: ${vault.saveError}` }}
        </span>
        <Button v-if="vault.conflict" size="sm" variant="outline" @click="reload">Reload</Button>
        <Button size="sm" variant="destructive" @click="vault.save(vault.conflict)">
            {{ vault.conflict ? 'Overwrite' : 'Retry' }}
        </Button>
    </div>
</template>

<script setup lang="ts">
    import { TriangleAlert } from 'lucide-vue-next';
    import { Button } from '@/components/ui/button';
    import { useVaultStore } from '@/stores/vault';

    const vault = useVaultStore();

    async function reload() {
        await vault.discard();
        await vault.open();
    }
</script>
