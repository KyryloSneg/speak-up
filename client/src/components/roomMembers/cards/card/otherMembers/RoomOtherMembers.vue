<template>
  <RoomMemberListTrigger v-if="hiddenItems.length" v-slot="slotProps">
    <button
      v-bind="getAriaAttributesFromProps(slotProps)"
      :class="cn(baseStyles.section(), styles.button)"
      :data-id="slotProps.dataId"
      :id="otherMembersId"
      @click="slotProps.click"
    >
      <div aria-hidden="true" :class="cn(styles.pictureGroup, 'shadow-sm')">
        <img
          v-if="firstSrc"
          :src="firstSrc"
          alt=""
          draggable="false"
          :class="styles.firstPicture"
        />
        <img
          v-if="secondSrc"
          :src="secondSrc"
          alt=""
          draggable="false"
          :class="styles.secondPicture"
        />
      </div>
      <p :class="cn(styles.p, 'truncate')">
        {{ hiddenItems.length }} hidden members
      </p>
    </button>
  </RoomMemberListTrigger>
</template>

<script setup lang="ts">
import RoomMemberListTrigger from "@/components/roomMemberListTrigger/RoomMemberListTrigger.vue";
import { useRoomStore } from "@/stores/room";
import getAriaAttributesFromProps from "@/utils/getAriaAttributesFromProps";
import { otherMembersId } from "@/utils/idConsts";
import type { LayoutItem } from "@/utils/roomMemberCards/calcMemberCardsLayout";
import { cn } from "@/utils/shadcn/utils";
import { computed } from "vue";
import * as baseStyles from "../RoomMemberCard.css";
import * as styles from "./RoomOtherMembers.css";

const props = defineProps<{
  hiddenItems: LayoutItem<false>[];
}>();

const roomStore = useRoomStore();
const hiddenUsers = computed(() =>
  props.hiddenItems
    .map(item => roomStore.room?.users.find(user => user.id === item.id))
    .filter(user => !!user),
);

const firstSrc = computed(() => hiddenUsers.value[0]?.picture);
const secondSrc = computed(() => hiddenUsers.value[1]?.picture);
</script>
