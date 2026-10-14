<template>
    <nav
        class="relative z-40 flex shrink-0 items-stretch border-t border-border/50 bg-sidebar pb-(--safe-bottom)"
    >
        <RouterLink
            v-for="item in NAV_ITEMS"
            :key="item.to"
            :to="item.to"
            :aria-label="item.label"
            :class="
                cn(
                    'flex h-(--bottom-nav-h) flex-1 items-center justify-center transition-colors active:bg-sidebar-accent/60',
                    isActive(item)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:text-sidebar-foreground',
                )
            "
        >
            <component :is="item.icon" class="size-7" />
        </RouterLink>
    </nav>
</template>

<script setup lang="ts">
    import { useRoute } from 'vue-router';
    import { cn } from '@/lib/utils';
    import { NAV_ITEMS } from './const';
    import type { NavItem } from './types';

    const route = useRoute();

    function isActive(item: NavItem) {
        return item.match.some((prefix) => route.path.startsWith(prefix));
    }
</script>
