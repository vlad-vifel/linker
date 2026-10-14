<template>
    <div class="flex flex-col gap-2">
        <Label :for="id">{{ label }}</Label>
        <div class="flex gap-2">
            <Input
                :id="id"
                v-model="text"
                :placeholder="placeholder"
                :readonly="IS_NATIVE"
                autocomplete="off"
                spellcheck="false"
                class="flex-1"
                @click="IS_NATIVE && browse()"
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Browse"
                :disabled="picking"
                @click="browse"
            >
                <Spinner v-if="picking" />
                <FolderOpen v-else />
            </Button>
        </div>
        <p v-if="hint" class="text-xs break-all text-muted-foreground">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
    import { FolderOpen } from 'lucide-vue-next';
    import { computed, ref, useId } from 'vue';
    import { toast } from 'vue-sonner';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Spinner } from '@/components/ui/spinner';
    import { IS_NATIVE, displayPath, errorMessage, storage } from '@/core/storage';

    const props = defineProps<{
        label: string;
        kind: 'folder' | 'file';
        placeholder?: string;
        hint?: string;
    }>();

    const model = defineModel<string>({ default: '' });
    const id = useId();
    const picking = ref(false);
    const text = computed({
        get: () => (IS_NATIVE ? displayPath(model.value) : model.value),
        set: (value) => (model.value = value),
    });

    async function browse() {
        picking.value = true;
        try {
            const path =
                props.kind === 'folder' ? await storage.pickFolder() : await storage.pickFile();
            if (path) model.value = path;
        } catch (error) {
            toast.error(errorMessage(error));
        } finally {
            picking.value = false;
        }
    }
</script>
