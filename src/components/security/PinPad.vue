<template>
    <div class="flex flex-col items-center gap-8">
        <div class="flex gap-4" aria-hidden="true">
            <span
                v-for="index in PIN_LENGTH"
                :key="index"
                :class="
                    cn(
                        'size-4 rounded-full border-2 transition-colors',
                        error ? 'border-destructive' : 'border-foreground',
                        index <= model.length && (error ? 'bg-destructive' : 'bg-foreground'),
                    )
                "
            />
        </div>
        <div class="grid grid-cols-3 gap-4">
            <template v-for="key in PIN_KEYS" :key="key">
                <span v-if="!key" />
                <Button
                    v-else-if="key === 'back'"
                    variant="ghost"
                    class="size-18 text-foreground hover:bg-transparent disabled:bg-transparent disabled:text-muted-foreground"
                    aria-label="Delete digit"
                    :disabled="disabled || !model.length"
                    @click="press(key)"
                >
                    <Delete class="size-6" />
                </Button>
                <Button
                    v-else
                    variant="outline"
                    class="size-18 rounded-full text-xl"
                    :disabled="disabled"
                    @click="press(key)"
                >
                    {{ key }}
                </Button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useEventListener } from '@vueuse/core';
    import { Delete } from 'lucide-vue-next';
    import { Button } from '@/components/ui/button';
    import { PIN_LENGTH } from '@/core/security';
    import { cn } from '@/lib/utils';
    import { PIN_KEYS } from './const';

    const props = defineProps<{ disabled?: boolean; error?: boolean }>();
    const emit = defineEmits<{ complete: [pin: string] }>();

    const model = defineModel<string>({ required: true });

    function press(key: string) {
        if (props.disabled) return;
        if (key === 'back') {
            model.value = model.value.slice(0, -1);
            return;
        }
        if (model.value.length >= PIN_LENGTH) return;
        const next = model.value + key;
        model.value = next;
        if (next.length === PIN_LENGTH) emit('complete', next);
    }

    useEventListener(window, 'keydown', (event: KeyboardEvent) => {
        if (/^\d$/.test(event.key)) press(event.key);
        else if (event.key === 'Backspace') press('back');
    });
</script>
