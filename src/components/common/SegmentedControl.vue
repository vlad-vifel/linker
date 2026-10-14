<template>
    <TabsRoot v-model="model">
        <TabsList class="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted/60 p-1">
            <TabsTrigger
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
                {{ option.label }}
            </TabsTrigger>
        </TabsList>
    </TabsRoot>
</template>

<script setup lang="ts" generic="T extends string">
    import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

    defineProps<{ options: { value: T; label: string }[] }>();

    const model = defineModel<T>({ required: true });
</script>
