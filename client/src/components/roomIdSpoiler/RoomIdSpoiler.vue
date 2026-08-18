<template>
  <div :class="styles.wrapper">
    <dl :class="styles.dl">
      <dt :class="cn(styles.dt, 'max-full-room-header:sr-only')">Room id:</dt>
      <dd
        aria-live="polite"
        :class="
          cn(
            styles.dd({ visibility: isHidden ? 'hidden' : 'visible' }),
            isHidden && 'select-none',
          )
        "
        :id="ddId"
        :data-hidden="isHidden"
      >
        {{ roomStore.room?.id }}
      </dd>
    </dl>
    <div :class="styles.buttonGroup">
      <UIButton
        :class="
          cn(
            styles.revealButton,
            'max-full-room-header:text-sm max-full-room-header:min-w-16.25!',
          )
        "
        :aria-controls="ddId"
        :aria-expanded="!isHidden"
        @click="toggleHidden"
      >
        {{ isHidden ? "Show" : "Hide" }}
      </UIButton>
      <UIButton
        aria-label="Copy room id"
        size="icon"
        variant="outline"
        aria-keyshortcuts="Control+Y"
        :class="styles.copyButton({ state: isCopied ? 'copied' : 'idle' })"
        @click="copy"
      >
        <Copy v-if="!isCopied" />
        <CopyCheck v-else />
      </UIButton>
      <div role="status" aria-live="polite" class="sr-only">
        {{ isCopied && "Room id copied to clipboard!" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UIButton } from "@/components/ui/shadcn/button";
import copyToClipboard from "@/services/copyToClipboard";
import { useRoomStore } from "@/stores/room";
import { cn } from "@/utils/shadcn/utils";
import { Copy, CopyCheck } from "@lucide/vue";
import { useDebounceFn, useEventListener } from "@vueuse/core";
import { onMounted, ref, useId } from "vue";
import { toast } from "vue-sonner";
import * as styles from "./RoomIdSpoiler.css";

const roomStore = useRoomStore();

const ddId = useId();

const isHidden = ref(true);
const isCopied = ref(false);

const debouncedClearIsCopied = useDebounceFn(() => {
  isCopied.value = false;
}, 2000);

const debouncedHideRoomId = useDebounceFn(() => {
  isHidden.value = true;
}, 5000);

function toggleHidden(value?: boolean): void {
  isHidden.value = typeof value === "boolean" ? value : !isHidden.value;
  if (!isHidden.value) debouncedHideRoomId();
}

async function copy(): Promise<void> {
  const roomId = roomStore.room?.id;
  if (!roomId) return;

  function onSuccess(): void {
    isCopied.value = true;
    debouncedClearIsCopied();
  }

  await copyToClipboard(roomId, {
    onSuccess,
    onError: e => toast.error(e.message),
  });
}

onMounted(() => {
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    if (!e.ctrlKey || e.code !== "KeyY") return;

    e.preventDefault();
    copy();
  });
});
</script>
