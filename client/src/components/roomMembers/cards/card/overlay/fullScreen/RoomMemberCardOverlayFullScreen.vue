<template>
  <UIDialog :open="open" @update:open="onOpenChange">
    <UITooltipProvider>
      <UITooltip>
        <UIDialogTrigger as-child>
          <UITooltipTrigger as-child>
            <BaseRoomMemberCardOverlayButton
              :aria-label="ariaLabel"
              @click="click"
            >
              <Minimize2 v-if="open" />
              <Maximize2 v-else />
            </BaseRoomMemberCardOverlayButton>
          </UITooltipTrigger>
        </UIDialogTrigger>
        <UITooltipContent
          :side-offset="ROOM_MEMBER_OVERLAY_SIDE_OFFSET"
          aria-hidden="true"
        >
          {{ ariaLabel }}
        </UITooltipContent>
      </UITooltip>
    </UITooltipProvider>
    <UIDialogContent
      :showCloseButton="false"
      :class="cn(styles.content({ type }))"
    >
      <UIDialogHeader :class="styles.header">
        <UIDialogTitle :class="styles.title">Details</UIDialogTitle>
        <UIDialogDescription class="sr-only">
          See in details what you seek
        </UIDialogDescription>
        <UIDialogClose as-child>
          <UIButton variant="destructive" size="icon-sm" aria-label="Close">
            <X />
          </UIButton>
        </UIDialogClose>
      </UIDialogHeader>
      <RoomMemberCard :userId :type :isFullScreen="true" />
    </UIDialogContent>
  </UIDialog>
</template>

<script setup lang="ts">
import BaseRoomMemberCardOverlayButton from "@/components/roomMembers/cards/card/overlay/base/BaseRoomMemberCardOverlayButton.vue";
import { ROOM_MEMBER_OVERLAY_SIDE_OFFSET } from "@/components/roomMembers/cards/card/overlay/base/data";
import RoomMemberCard from "@/components/roomMembers/cards/card/RoomMemberCard.vue";
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import UIDialog from "@/components/ui/shadcn/dialog/UIDialog.vue";
import UIDialogClose from "@/components/ui/shadcn/dialog/UIDialogClose.vue";
import UIDialogContent from "@/components/ui/shadcn/dialog/UIDialogContent.vue";
import UIDialogDescription from "@/components/ui/shadcn/dialog/UIDialogDescription.vue";
import UIDialogHeader from "@/components/ui/shadcn/dialog/UIDialogHeader.vue";
import UIDialogTitle from "@/components/ui/shadcn/dialog/UIDialogTitle.vue";
import UIDialogTrigger from "@/components/ui/shadcn/dialog/UIDialogTrigger.vue";
import UITooltip from "@/components/ui/shadcn/tooltip/UITooltip.vue";
import UITooltipContent from "@/components/ui/shadcn/tooltip/UITooltipContent.vue";
import UITooltipProvider from "@/components/ui/shadcn/tooltip/UITooltipProvider.vue";
import UITooltipTrigger from "@/components/ui/shadcn/tooltip/UITooltipTrigger.vue";
import { useRoomStore } from "@/stores/room";
import type { RemoteStreams } from "@/stores/webrtc";
import { cn } from "@/utils/shadcn/utils";
import { Maximize2, Minimize2, X } from "@lucide/vue";
import { useFullscreen } from "@vueuse/core";
import { computed, watch } from "vue";
import * as styles from "./RoomMemberCardOverlayFullScreen.css";

// unfortunately, pressing escape inside volume popover leads to dialog
// close (using PopoverContent's to doesn't work,
// using different escape key event propagation stopping
// and preventing doesn't work either)

const props = defineProps<{
  userId: string;
  type: "user" | "screenSharing";
  streamInfo: RemoteStreams | null;
}>();

function click(): void {
  roomStore.fullScreenItem = open.value
    ? null
    : { userId: props.userId, type: props.type };
}

function onOpenChange(open: boolean): void {
  if (!open) roomStore.fullScreenItem = null;
}

const roomStore = useRoomStore();

const { isFullscreen } = useFullscreen();
const open = computed(
  () =>
    roomStore.fullScreenItem?.userId === props.userId &&
    roomStore.fullScreenItem.type === props.type &&
    isFullscreen.value,
);

const ariaLabel = computed(() =>
  open.value ? "Exit fullscreen" : "Enter fullscreen",
);

watch(open, (value, oldValue) => {
  if (
    !value &&
    oldValue &&
    roomStore.fullScreenItem?.userId === props.userId &&
    roomStore.fullScreenItem.type === props.type
  ) {
    roomStore.fullScreenItem = null;
  }
});
</script>
