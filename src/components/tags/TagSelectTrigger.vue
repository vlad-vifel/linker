<template>
    <div
        :class="
            cn(
                'flex h-12 w-full min-w-0 items-stretch rounded-md border border-input bg-input/30 shadow-xs transition-colors hover:bg-input/50',
                props.class,
            )
        "
    >
        <button
            type="button"
            class="flex min-w-0 flex-1 items-center pl-2.5 text-left"
            @click="emit('open')"
        >
            <TagChips
                v-if="keys.length"
                :keys="keys"
                class="scrollbar-none min-w-0 flex-1 flex-nowrap overflow-x-auto"
            />
            <span v-else class="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {{ placeholder }}
            </span>
        </button>
        <button
            type="button"
            class="flex w-12 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
            :aria-label="keys.length ? 'Clear tags' : 'Open tags'"
            @click="keys.length ? emit('clear') : emit('open')"
        >
            <X v-if="keys.length" class="size-5" />
            <ChevronDown v-else class="size-5" />
        </button>
    </div>
</template>

<script setup lang="ts">
    import { ChevronDown, X } from 'lucide-vue-next';
    import type { HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';
    import TagChips from './TagChips.vue';

    const props = defineProps<{
        keys: string[];
        placeholder: string;
        class?: HTMLAttributes['class'];
    }>();
    const emit = defineEmits<{ open: []; clear: [] }>();
</script>
