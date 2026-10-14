<template>
    <div class="flex flex-col gap-2">
        <Label :for="id">{{ label }}</Label>
        <Input
            :id="id"
            v-model="model"
            :placeholder="placeholder"
            autocomplete="off"
            spellcheck="false"
        />
        <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
    import { useId } from 'vue';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';

    defineProps<{ label: string; placeholder?: string; hint?: string }>();

    const model = defineModel<string>({ default: '' });
    const id = useId();
</script>
