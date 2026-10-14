import Sortable from 'sortablejs';
import { onBeforeUnmount, type Ref, watch } from 'vue';

export function useDragReorder<T>(
    items: Ref<T[]>,
    container: Ref<HTMLElement | null>,
    enabled: Ref<boolean>,
) {
    let sortable: Sortable | null = null;

    function onEnd({ oldIndex, newIndex, item, from }: Sortable.SortableEvent) {
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;
        from.removeChild(item);
        from.insertBefore(item, from.children[oldIndex] ?? null);
        const next = [...items.value];
        next.splice(newIndex, 0, ...next.splice(oldIndex, 1));
        items.value = next;
    }

    function destroy() {
        sortable?.destroy();
        sortable = null;
    }

    watch(
        [container, enabled],
        ([element, active]) => {
            destroy();
            if (!element || !active) return;
            sortable = Sortable.create(element, {
                handle: '[data-drag-handle]',
                animation: 200,
                forceFallback: true,
                ghostClass: 'opacity-30',
                fallbackClass: 'shadow-lg',
                onEnd,
            });
        },
        { flush: 'post' },
    );

    onBeforeUnmount(destroy);
}
