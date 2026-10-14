<template>
    <div class="relative">
        <Search
            class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input v-bind="$attrs" v-model="model" autocomplete="off" class="px-11" />
        <button
            v-if="model"
            type="button"
            aria-label="Clear search"
            class="absolute top-0 right-0 flex size-12 items-center justify-center text-muted-foreground hover:text-foreground"
            @click="model = ''"
        >
            <X class="size-5" />
        </button>
    </div>
</template>

<script setup lang="ts">
    import { Search, X } from 'lucide-vue-next';
    import { Input } from '@/components/ui/input';

    defineOptions({ inheritAttrs: false });

    const model = defineModel<string>({ default: '' });
</script>
