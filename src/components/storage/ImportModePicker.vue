<template>
    <div class="flex flex-col gap-3">
        <SegmentedControl v-model="mode" :options="IMPORT_MODES" />
        <Select v-if="mode === 'merge'" v-model="target">
            <SelectTrigger>
                <SelectValue placeholder="Select storage" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem v-for="item in storages.list" :key="item.id" :value="item.id">
                    {{ item.name }}
                </SelectItem>
            </SelectContent>
        </Select>
    </div>
</template>

<script setup lang="ts">
    import SegmentedControl from '@/components/common/SegmentedControl.vue';
    import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from '@/components/ui/select';
    import { useStoragesStore } from '@/stores/storages';
    import { IMPORT_MODES } from './const';
    import type { ImportMode } from './types';

    const mode = defineModel<ImportMode>('mode', { required: true });
    const target = defineModel<string>('target', { required: true });
    const storages = useStoragesStore();
</script>
