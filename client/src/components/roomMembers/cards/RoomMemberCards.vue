<template>
  <div :class="styles.wrapper">
    <section :class="styles.rootSection">
      <h2 class="sr-only">Members</h2>
      <section
        v-if="hasPinned"
        :class="styles.pinnedSection"
        :style="pinnedSectionStyle"
        ref="pinnedSection"
      >
        <h3 class="sr-only">Pinned</h3>
        <UIInvisibleFocus
          v-if="hasUnpinned"
          :wrapperElemToFocus="unpinnedRef"
          class="top-4"
        >
          Skip to the unpinned members
        </UIInvisibleFocus>
        <RoomMemberCardsList
          :layout="pinnedLayout"
          :isInstantTransition="isSingleItem"
        >
          <template #otherItems="slotProps">
            <RoomOtherPinnedCards
              :hiddenItemsAmount="slotProps.hiddenItems.length"
            />
          </template>
        </RoomMemberCardsList>
      </section>
      <section
        v-if="hasUnpinned"
        :class="styles.unpinnedSection"
        :style="unpinnedSectionStyle"
        ref="unpinnedSection"
      >
        <h3 class="sr-only">Unpinned</h3>
        <UIInvisibleFocus v-if="hasPinned" :wrapperElemToFocus="pinnedRef">
          Go back to the pinned members
        </UIInvisibleFocus>
        <RoomMemberCardsList
          :layout="unpinnedLayout"
          :isInstantTransition="isSingleItem"
        >
          <template #otherItems="slotProps">
            <RoomOtherMembers :hiddenItems="slotProps.hiddenItems" />
          </template>
        </RoomMemberCardsList>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import RoomOtherMembers from "@/components/roomMembers/cards/card/otherMembers/RoomOtherMembers.vue";
import RoomOtherPinnedCards from "@/components/roomMembers/cards/card/otherPinnedCards/RoomOtherPinnedCards.vue";
import RoomMemberCardsList from "@/components/roomMembers/cards/list/RoomMemberCardsList.vue";
import UIInvisibleFocus from "@/components/ui/custom/invisible-focus/UIInvisibleFocus.vue";
import useMemberCardsLayout from "@/composables/useMemberCardsLayout";
import { useRoomStore } from "@/stores/room";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { computed, useTemplateRef, type StyleValue } from "vue";
import * as styles from "./RoomMemberCards.css";

const roomStore = useRoomStore();
const sortedPinnedItems = computed(() => {
  const sortedRoomUsers = roomStore.sortedUsers;
  const pinnedItems = roomStore.pinnedItems;

  if (!pinnedItems?.length) return [];

  const userIdsInRoom = sortedRoomUsers.map(user => user.id);
  const pinnedItemsInRoom = pinnedItems.filter(item =>
    userIdsInRoom.includes(item.userId),
  );

  const screenSharingItems = pinnedItemsInRoom.filter(
    item => item.type === "screenSharing",
  );

  const sortedUserItems = pinnedItemsInRoom
    .filter(item => item.type === "user")
    .sort((a, b) => {
      const aIndex = sortedRoomUsers.findIndex(user => user.id === a.userId);
      const bIndex = sortedRoomUsers.findIndex(user => user.id === b.userId);

      // preserve the order
      return aIndex - bIndex;
    });

  // screen sharing items first, only then user ones
  return [...screenSharingItems, ...sortedUserItems];
});

const sortedUnpinnedItems = computed(() => {
  const pinnedItems = sortedPinnedItems.value;
  return roomStore.sortedUsers
    .filter(
      item =>
        !pinnedItems.some(
          pinnedItem =>
            pinnedItem.type === "user" && pinnedItem.userId === item.id,
        ),
    )
    .map(user => ({ userId: user.id, type: "user" as const }));
});

const hasPinned = computed(() => sortedPinnedItems.value.length > 0);
const hasUnpinned = computed(() => sortedUnpinnedItems.value.length > 0);

const isSingleItem = computed(
  () => [...sortedPinnedItems.value, ...sortedUnpinnedItems.value].length === 1,
);

// make small viewports life slighly more bearable
const pinnedSectionInlineVars = computed(() => ({
  [styles.mobilePinnedSectionFlex]: "1 1 66.66%",
  [styles.desktopPinnedSectionFlex]: "1 1 75%",
}));

const unpinnedSectionInlineVars = computed(() => ({
  [styles.mobileUnpinnedSectionFlex]: "0 0 33.33%",
  [styles.desktopUnpinnedSectionFlex]: "0 0 25%",
}));

const pinnedSectionStyle = computed<StyleValue>(() => {
  const inlineVars = assignInlineVars(pinnedSectionInlineVars.value);
  if (!hasUnpinned.value) inlineVars.flex = "1 1 100%";

  return inlineVars;
});

const unpinnedSectionStyle = computed<StyleValue>(() => {
  const inlineVars = assignInlineVars(unpinnedSectionInlineVars.value);
  if (!hasPinned.value) inlineVars.flex = "1 1 100%";

  return inlineVars;
});

const pinnedRef = useTemplateRef("pinnedSection");
const unpinnedRef = useTemplateRef("unpinnedSection");

const pinnedLayout = useMemberCardsLayout(sortedPinnedItems, pinnedRef);
const unpinnedLayout = useMemberCardsLayout(sortedUnpinnedItems, unpinnedRef);
</script>
