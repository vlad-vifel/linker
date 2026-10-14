<template>
    <AlertDialog v-model:open="open">
        <AlertDialogContent class="grid-cols-[minmax(0,1fr)]">
            <AlertDialogHeader>
                <AlertDialogTitle>{{ title }}</AlertDialogTitle>
                <AlertDialogDescription
                    v-if="description || $slots.default"
                    class="line-clamp-3 break-all"
                >
                    {{ description }}
                    <slot />
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    :variant="destructive ? 'destructive' : 'default'"
                    @click="emit('confirm')"
                >
                    {{ confirmText }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
    } from '@/components/ui/alert-dialog';

    withDefaults(
        defineProps<{
            title: string;
            description?: string;
            confirmText?: string;
            destructive?: boolean;
        }>(),
        { description: undefined, confirmText: 'Confirm' },
    );
    const emit = defineEmits<{ confirm: [] }>();

    const open = defineModel<boolean>('open', { default: false });
</script>
