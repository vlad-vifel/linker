<template>
    <Dialog v-model:open="open">
        <DialogContent
            :show-close-button="false"
            class="max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 p-0 max-sm:h-dvh max-sm:max-h-none max-sm:pt-(--safe-top) max-sm:max-w-none max-sm:rounded-none max-sm:ring-0"
        >
            <header class="flex h-14 items-center gap-2 border-b border-border/50 pr-2 pl-4">
                <DialogTitle class="min-w-0 flex-1 truncate text-base font-semibold">
                    {{ title }}
                    <span v-if="hint" class="font-normal text-muted-foreground">({{ hint }})</span>
                </DialogTitle>
                <DialogClose as-child>
                    <Button variant="ghost" size="icon" aria-label="Close">
                        <X class="size-6" />
                    </Button>
                </DialogClose>
            </header>
            <div class="flex flex-col gap-4 overflow-y-auto p-4">
                <DialogDescription :class="cn('text-muted-foreground', !description && 'sr-only')">
                    {{ description ?? title }}
                </DialogDescription>
                <slot />
            </div>
            <footer v-if="$slots.footer" class="flex gap-2 border-t border-border/50 p-4">
                <slot name="footer" />
            </footer>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
    import { X } from 'lucide-vue-next';
    import { DialogClose } from 'reka-ui';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
    import { cn } from '@/lib/utils';

    defineProps<{ title: string; hint?: string; description?: string }>();

    const open = defineModel<boolean>('open', { default: false });
</script>
