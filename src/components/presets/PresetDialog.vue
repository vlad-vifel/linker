<template>
    <AppDialog
        :open="dialogs.presetOpen"
        :title="preset ? 'Edit preset' : 'Add preset'"
        @update:open="onOpen"
    >
        <PresetForm
            v-if="dialogs.presetOpen"
            :key="preset?.id ?? 'new'"
            ref="form"
            :preset="preset ?? undefined"
            :initial="dialogs.presetInitial ?? undefined"
            @submit="save"
        />
        <template #footer>
            <div class="flex w-full flex-col gap-2">
                <Button type="submit" :form="form?.formId" :disabled="form?.invalid">Save</Button>
                <Button v-if="preset" variant="destructive" @click="confirmOpen = true">
                    <Trash2 />
                    Delete preset
                </Button>
            </div>
        </template>
    </AppDialog>
    <DeletePresetDialog
        v-if="preset"
        v-model:open="confirmOpen"
        :preset="preset"
        @deleted="dialogs.closePreset()"
    />
</template>

<script setup lang="ts">
    import { Trash2 } from 'lucide-vue-next';
    import { computed, ref } from 'vue';
    import { toast } from 'vue-sonner';
    import AppDialog from '@/components/common/AppDialog.vue';
    import { Button } from '@/components/ui/button';
    import type { PresetDraft } from '@/core/format';
    import { useDialogsStore } from '@/stores/dialogs';
    import { usePresetsStore } from '@/stores/presets';
    import DeletePresetDialog from './DeletePresetDialog.vue';
    import PresetForm from './PresetForm.vue';

    const dialogs = useDialogsStore();
    const presets = usePresetsStore();
    const confirmOpen = ref(false);
    const form = ref<InstanceType<typeof PresetForm> | null>(null);

    const preset = computed(() =>
        dialogs.presetId ? (presets.byId.get(dialogs.presetId) ?? null) : null,
    );

    function onOpen(open: boolean) {
        if (!open) dialogs.closePreset();
    }

    function save(draft: PresetDraft) {
        const saved = preset.value ? presets.update(preset.value.id, draft) : presets.add(draft);
        if (!saved) return;
        toast.success('Saved');
        dialogs.closePreset();
    }
</script>
