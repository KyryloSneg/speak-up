<template>
  <UIPopover v-slot="{ open }">
    <UIPopoverTrigger as-child>
      <BaseRoomMemberCardOverlayButton
        :aria-label="`${open ? 'Close' : 'Open'} volume menu`"
      >
        <Volume1 />
      </BaseRoomMemberCardOverlayButton>
    </UIPopoverTrigger>
    <UIPopoverContent :side-offset="ROOM_MEMBER_OVERLAY_SIDE_OFFSET">
      <dl :class="styles.dl">
        <dt :class="styles.dt" :id="labelId">
          {{ type === "user" ? "User" : "Screen sharing" }} volume:
        </dt>
        <dd :class="styles.dd">
          {{ volume[0] }}
        </dd>
      </dl>
      <UISlider
        v-model="volume"
        :max="200"
        :step="1"
        :aria-labelledby="labelId"
      />
    </UIPopoverContent>
  </UIPopover>
</template>

<script setup lang="ts">
import BaseRoomMemberCardOverlayButton from "@/components/roomMembers/cards/card/overlay/base/BaseRoomMemberCardOverlayButton.vue";
import { ROOM_MEMBER_OVERLAY_SIDE_OFFSET } from "@/components/roomMembers/cards/card/overlay/base/data";
import UIPopover from "@/components/ui/shadcn/popover/UIPopover.vue";
import UIPopoverContent from "@/components/ui/shadcn/popover/UIPopoverContent.vue";
import UIPopoverTrigger from "@/components/ui/shadcn/popover/UIPopoverTrigger.vue";
import { UISlider } from "@/components/ui/shadcn/slider";
import useCustomVolume from "@/composables/useCustomVolume";
import { Volume1 } from "@lucide/vue";
import { useId } from "vue";
import * as styles from "./RoomMemberCardOverlayVolume.css";

const props = defineProps<{
  userId: string;
  type: "user" | "screenSharing";
}>();

const labelId = useId();
const volume = useCustomVolume(props.userId, props.type);
</script>
