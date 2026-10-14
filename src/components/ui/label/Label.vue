<template>
    <Label
        v-bind="delegatedProps"
        :class="
            cn('flex items-center gap-2 text-sm leading-none font-medium select-none', props.class)
        "
        data-slot="label"
    >
        <slot />
    </Label>
</template>

<script setup lang="ts">
    import { reactiveOmit } from '@vueuse/core';
    import type { LabelProps } from 'reka-ui';
    import { Label } from 'reka-ui';
    import type { HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

    const delegatedProps = reactiveOmit(props, 'class');
</script>
