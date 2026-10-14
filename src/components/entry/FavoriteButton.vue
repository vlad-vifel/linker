<template>
    <Button
        type="button"
        :variant="variant"
        :size="size"
        :aria-pressed="active"
        :aria-label="active ? 'Remove from favorites' : 'Add to favorites'"
        @click="emit('toggle')"
    >
        <Star
            :class="
                cn(
                    active && 'fill-warning text-warning',
                    !active && variant === 'ghost' && 'text-muted-foreground',
                )
            "
        />
    </Button>
</template>

<script setup lang="ts">
    import { Star } from 'lucide-vue-next';
    import { Button } from '@/components/ui/button';
    import { cn } from '@/lib/utils';

    withDefaults(
        defineProps<{
            active: boolean;
            size?: 'icon-sm' | 'icon';
            variant?: 'ghost' | 'outline';
        }>(),
        { size: 'icon', variant: 'outline' },
    );
    const emit = defineEmits<{ toggle: [] }>();
</script>
