<template>
    <ConfirmDialog
        v-model:open="open"
        title="Delete preset?"
        :description="preset.name ?? undefined"
        confirm-text="Delete"
        destructive
        @confirm="remove"
    />
</template>

<script setup lang="ts">
    import { toast } from 'vue-sonner';
    import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
    import type { Preset } from '@/core/format';
    import { usePresetsStore } from '@/stores/presets';

    const props = defineProps<{ preset: Preset }>();
    const emit = defineEmits<{ deleted: [] }>();

    const open = defineModel<boolean>('open', { default: false });
    const presets = usePresetsStore();

    function remove() {
        emit('deleted');
        presets.remove(props.preset.id);
        toast.success('Deleted');
    }
</script>
