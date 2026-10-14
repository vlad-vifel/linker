import { ref } from 'vue';
import { errorMessage } from '@/core/storage';

export function useAsyncAction() {
    const pending = ref(false);
    const error = ref<string | null>(null);

    async function run<T>(action: () => Promise<T>) {
        pending.value = true;
        error.value = null;
        try {
            return await action();
        } catch (caught) {
            error.value = errorMessage(caught);
            return undefined;
        } finally {
            pending.value = false;
        }
    }

    return { pending, error, run };
}
