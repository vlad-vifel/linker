import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';
import { useStoragesStore } from '@/stores/storages';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/welcome', name: 'welcome', component: () => import('@/views/WelcomeView.vue') },
        {
            path: '/',
            component: AppLayout,
            children: [
                { path: '', redirect: '/links' },
                { path: 'links', name: 'links', component: () => import('@/views/LinksView.vue') },
                {
                    path: 'presets',
                    name: 'presets',
                    component: () => import('@/views/PresetsView.vue'),
                },
                { path: 'add', name: 'add', component: () => import('@/views/AddView.vue') },
                {
                    path: 'settings',
                    name: 'settings',
                    component: () => import('@/views/SettingsView.vue'),
                },
            ],
        },
        { path: '/:pathMatch(.*)*', redirect: '/links' },
    ],
});

router.beforeEach((to) => {
    const hasStorages = useStoragesStore().list.length > 0;
    if (!hasStorages && to.name !== 'welcome') return { name: 'welcome' };
    if (hasStorages && to.name === 'welcome') return { name: 'links' };
});

export default router;
