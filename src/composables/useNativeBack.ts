import { App } from '@capacitor/app';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { IS_NATIVE } from '@/core/storage';

export function useNativeBack() {
    const router = useRouter();
    let handle: { remove(): Promise<void> } | null = null;

    onMounted(async () => {
        if (!IS_NATIVE) return;
        handle = await App.addListener('backButton', () => {
            if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) {
                (document.activeElement ?? document.body).dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'Escape',
                        code: 'Escape',
                        keyCode: 27,
                        bubbles: true,
                        cancelable: true,
                    }),
                );
            } else if (window.history.state?.back) router.back();
            else if (router.currentRoute.value.path !== '/links') router.replace('/links');
            else App.exitApp();
        });
    });
    onUnmounted(() => handle?.remove());
}
