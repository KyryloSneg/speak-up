<template>
  <p :class="cn(baseStyles.section(), styles.p, 'select-none')">
    <span aria-hidden="true"> {{ hiddenItemsAmount }} more </span>
    <span class="sr-only"> {{ hiddenItemsAmount }} pinned items unshown </span>
  </p>
</template>

<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import * as baseStyles from "../RoomMemberCard.css";
import * as styles from "./RoomOtherPinnedCards.css";

defineProps<{
  hiddenItemsAmount: number;
}>();
</script>
