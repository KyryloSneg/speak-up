<template>
  <UITooltipProvider>
    <UITooltip>
      <UITooltipTrigger as-child>
        <slot
          v-bind="{ 'aria-label': ariaLabel }"
          :value="isPinned"
          :icon
          :click
        />
      </UITooltipTrigger>
      <UITooltipContent
        :side-offset="
          isCardOverlay ? ROOM_MEMBER_OVERLAY_SIDE_OFFSET : undefined
        "
      >
        {{ tooltipContent }}
      </UITooltipContent>
    </UITooltip>
  </UITooltipProvider>
</template>

<script setup lang="ts">
import { ROOM_MEMBER_OVERLAY_SIDE_OFFSET } from "@/components/roomMembers/cards/card/overlay/base/data";
import UITooltip from "@/components/ui/shadcn/tooltip/UITooltip.vue";
import UITooltipContent from "@/components/ui/shadcn/tooltip/UITooltipContent.vue";
import UITooltipProvider from "@/components/ui/shadcn/tooltip/UITooltipProvider.vue";
import UITooltipTrigger from "@/components/ui/shadcn/tooltip/UITooltipTrigger.vue";
import { useRoomStore } from "@/stores/room";
import { Pin, PinOff } from "@lucide/vue";
import { computed, type Component } from "vue";

defineSlots<{
  default(props: {
    value: boolean;
    icon: Component;
    "aria-label": string;
    click: () => void;
  }): unknown;
}>();

const props = defineProps<{
  userId: string;
  isCardOverlay?: boolean;
}>();

function click() {
  if (!roomStore.pinnedItems) return;
  if (isPinned.value) {
    roomStore.pinnedItems = roomStore.pinnedItems.filter(
      item => !(item.type === "user" && item.userId === props.userId),
    );
  } else {
    roomStore.pinnedItems.push({ userId: props.userId, type: "user" });
  }
}

const roomStore = useRoomStore();
const isPinned = computed(
  () =>
    !!roomStore.pinnedItems?.some(
      item => item.type === "user" && item.userId === props.userId,
    ),
);

const icon = computed(() => (isPinned.value ? PinOff : Pin));
const ariaLabel = computed(() => (isPinned.value ? "Unpin" : "Pin"));
const tooltipContent = computed(
  () => `${isPinned.value ? "Unpin" : "Pin"} member`,
);
</script>
