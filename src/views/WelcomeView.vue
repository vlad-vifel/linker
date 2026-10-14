<template>
    <div class="mx-auto flex h-dvh max-w-md flex-col">
        <div
            class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-[calc(var(--safe-top)+3rem)] pb-8"
        >
            <div class="flex flex-col items-center gap-3 text-center">
                <div class="flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <LockKeyhole v-if="step === 'pin'" class="size-7" />
                    <Link2 v-else class="size-7" />
                </div>
                <h1 class="text-2xl font-semibold">
                    {{ step === 'pin' ? 'Protect with PIN' : 'Linker' }}
                </h1>
                <p v-if="step === 'pin'" class="text-sm text-muted-foreground">
                    Optional. The PIN is asked every time the app starts. You can set or remove it
                    later in Settings.
                </p>
                <p v-else class="text-sm text-muted-foreground">
                    Links and notes with tags. Everything stays in a file on your device, nothing is
                    sent anywhere.
                </p>
            </div>
            <PinSetup v-if="step === 'pin'" @done="savePin" />
            <AddStorageForms v-else ref="forms" @done="onStorage" />
        </div>
        <div
            v-if="step === 'pin' || forms?.ready"
            class="border-t border-border/50 p-4 pb-[calc(var(--safe-bottom)+1rem)]"
        >
            <Button v-if="step === 'pin'" variant="outline" class="w-full" @click="finish">
                Skip
            </Button>
            <AddStorageSubmit v-else :forms="forms" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Link2, LockKeyhole } from 'lucide-vue-next';
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import PinSetup from '@/components/security/PinSetup.vue';
    import AddStorageForms from '@/components/storage/AddStorageForms.vue';
    import AddStorageSubmit from '@/components/storage/AddStorageSubmit.vue';
    import { Button } from '@/components/ui/button';
    import { useLockStore } from '@/stores/lock';

    const router = useRouter();
    const lock = useLockStore();
    const forms = ref<InstanceType<typeof AddStorageForms> | null>(null);
    const step = ref<'storage' | 'pin'>('storage');

    function finish() {
        router.replace('/links');
    }

    function onStorage() {
        if (lock.hasPin) finish();
        else step.value = 'pin';
    }

    async function savePin(pin: string) {
        await lock.setPin(pin);
        finish();
    }
</script>
