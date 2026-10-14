<template>
    <div v-if="others.length" class="flex flex-col gap-2">
        <p class="text-xs font-medium text-muted-foreground">Switch to another storage</p>
        <Button
            v-for="other in others"
            :key="other.id"
            variant="outline"
            class="justify-start"
            @click="activate(other.id)"
        >
            {{ other.name }}
        </Button>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { toast } from 'vue-sonner';
    import { Button } from '@/components/ui/button';
    import { errorMessage } from '@/core/storage';
    import { useStorageActions } from '@/composables/useStorageActions';
    import { useStoragesStore } from '@/stores/storages';

    const storages = useStoragesStore();
    const actions = useStorageActions();
    const others = computed(() => storages.list.filter((item) => item.id !== storages.active?.id));

    async function activate(id: string) {
        try {
            await actions.switchTo(id);
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }
</script>
