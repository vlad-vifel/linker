import { Bookmark, Link2, Plus, Settings } from 'lucide-vue-next';
import type { NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
    { label: 'Links', to: '/links', icon: Link2, match: ['/links'] },
    { label: 'Presets', to: '/presets', icon: Bookmark, match: ['/presets'] },
    { label: 'Add', to: '/add', icon: Plus, match: ['/add'] },
    { label: 'Settings', to: '/settings', icon: Settings, match: ['/settings'] },
];
