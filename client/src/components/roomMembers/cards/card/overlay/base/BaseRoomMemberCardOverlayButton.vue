<template>
  <UIButton variant="ghost" size="icon" :class="styles.button">
    <slot />
  </UIButton>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import * as styles from "./BaseRoomMemberCardOverlayButton.css";
</script>
