import { App } from '@capacitor/app';
import { ref } from 'vue';
import { Native, IS_NATIVE } from '@/core/storage';

const granted = ref(!IS_NATIVE);

async function refresh() {
    granted.value = (await Native.check()).granted;
}

if (IS_NATIVE) {
    refresh();
    App.addListener('resume', refresh);
}

export function useFilesAccess() {
    return { granted, request: () => Native.request() };
}
