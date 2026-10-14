<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button
                variant="ghost"
                size="icon-sm"
                class="text-muted-foreground"
                :aria-label="label"
            >
                <Ellipsis />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :class="contentClass">
            <slot />
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<script setup lang="ts">
    import { Ellipsis } from 'lucide-vue-next';
    import { Button } from '@/components/ui/button';
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';

    withDefaults(defineProps<{ label: string; contentClass?: string }>(), {
        contentClass: 'w-40',
    });
</script>
