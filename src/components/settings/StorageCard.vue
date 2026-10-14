<template>
    <ListCard @select="activate">
        <p class="flex items-center justify-between gap-2 text-sm font-medium">
            <span class="truncate">{{ item.name }}</span>
            <StatusChip v-if="active">active</StatusChip>
        </p>
        <p class="text-xs text-muted-foreground">
            {{ item.count === null ? '—' : formatCount(item.count) }}
        </p>
        <p class="truncate font-mono text-xs text-muted-foreground">{{ displayPath(item.path) }}</p>
        <template #actions>
            <StorageMenu :item="item" />
        </template>
    </ListCard>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { toast } from 'vue-sonner';
    import ListCard from '@/components/common/ListCard.vue';
    import StatusChip from '@/components/common/StatusChip.vue';
    import { useStorageActions } from '@/composables/useStorageActions';
    import { displayPath, errorMessage } from '@/core/storage';
    import { formatCount } from '@/lib/format';
    import { useStoragesStore } from '@/stores/storages';
    import type { StorageRef } from '@/types/storage';
    import StorageMenu from './StorageMenu.vue';

    const props = defineProps<{ item: StorageRef }>();

    const storages = useStoragesStore();
    const actions = useStorageActions();
    const active = computed(() => storages.active?.id === props.item.id);

    async function activate() {
        try {
            await actions.switchTo(props.item.id);
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }
</script>
