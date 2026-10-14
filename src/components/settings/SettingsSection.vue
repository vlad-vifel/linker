<template>
    <CollapsibleRoot v-model:open="open" class="rounded-xl border border-border/50 bg-card">
        <CollapsibleTrigger class="flex w-full items-center gap-3 p-4 text-left">
            <div class="min-w-0 flex-1">
                <h2 class="text-base font-semibold">{{ title }}</h2>
                <p v-if="description" class="mt-0.5 text-xs text-muted-foreground">
                    {{ description }}
                </p>
            </div>
            <ChevronDown
                :class="
                    cn(
                        'size-6 shrink-0 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                    )
                "
            />
        </CollapsibleTrigger>
        <CollapsibleContent class="px-4 pb-4">
            <slot />
        </CollapsibleContent>
    </CollapsibleRoot>
</template>

<script setup lang="ts">
    import { ChevronDown } from 'lucide-vue-next';
    import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui';
    import { ref } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{ title: string; description?: string; defaultOpen?: boolean }>();

    const open = ref(props.defaultOpen ?? false);
</script>
