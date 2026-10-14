<template>
    <textarea
        ref="textarea"
        v-model="modelValue"
        rows="2"
        :class="
            cn(
                'bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 w-full resize-none overflow-hidden rounded-md border px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                props.class,
            )
        "
        data-slot="textarea"
    />
</template>

<script setup lang="ts">
    import { useTextareaAutosize } from '@vueuse/core';
    import { useTemplateRef, type HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{ class?: HTMLAttributes['class'] }>();

    const modelValue = defineModel<string>({ default: '' });

    const element = useTemplateRef<HTMLTextAreaElement>('textarea');

    useTextareaAutosize({ element, input: modelValue });
</script>
