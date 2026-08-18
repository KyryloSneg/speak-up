<template>
  <TransitionGroup
    tag="ul"
    :name="styles.transitionGroupName"
    :class="styles.cards"
    :style="layout?.gridStyle"
    :data-animating="isAnimating"
    :data-resizing="isResizing"
    :data-instant-transition="isInstantTransition"
  >
    <li
      v-for="item in visibleItems"
      :key="item.id"
      :class="styles.li"
      :style="item.style"
    >
      <RoomMemberCard :userId="item.id" :type="item.type" />
    </li>
    <li
      v-if="hiddenItems?.length"
      key="otherMembers"
      :class="styles.li"
      :style="layout.initLastVisibleItem?.style"
    >
      <slot name="otherItems" :hiddenItems />
    </li>
  </TransitionGroup>
</template>

<script setup lang="ts">
import RoomMemberCard from "@/components/roomMembers/cards/card/RoomMemberCard.vue";
import type useMemberCardsLayout from "@/composables/useMemberCardsLayout";
import type { ExtendedLayoutItem } from "@/composables/useMemberCardsLayout";
import getUnitValue from "@/utils/getUnitValue";
import { useTimeoutFn } from "@vueuse/core";
import { computed, ref, TransitionGroup, watch, type UnwrapRef } from "vue";
import * as styles from "./RoomMemberCardsList.css";

defineSlots<{
  otherItems(props: { hiddenItems: ExtendedLayoutItem<false>[] }): unknown;
}>();

const { layout, isInstantTransition } = defineProps<{
  layout: UnwrapRef<ReturnType<typeof useMemberCardsLayout>>;
  isInstantTransition?: boolean;
}>();

const visibleItems = computed(
  () =>
    layout?.items?.filter(
      item => item.visible,
    ) as unknown as ExtendedLayoutItem<true>[],
);

const hiddenItems = computed(
  () =>
    layout?.items?.filter(
      item => !item.visible,
    ) as unknown as ExtendedLayoutItem<false>[],
);

// basically, we leave only "item appeared" animation here;
// resizes are handled by responsive design
// (items shuffle animation leads to a messy result)
const isAnimating = ref(false);
const isResizing = ref(false);

const animationDuration = computed(() =>
  isInstantTransition ? 0 : getUnitValue(styles.defaultTransitionDuration),
);

const animationTimeoutFn = useTimeoutFn(
  () => {
    isAnimating.value = false;
  },
  animationDuration,
  { immediate: false },
);

const resizingTimeoutFn = useTimeoutFn(
  () => {
    isResizing.value = false;
  },
  Math.min(150, animationDuration.value),
  { immediate: false },
);

watch(
  () => layout,
  () => {
    isAnimating.value = true;
    isResizing.value = true;

    animationTimeoutFn.start();
    resizingTimeoutFn.start();
  },
  { deep: true },
);
</script>
