<template>
  <ul :class="styles.list">
    <li>
      <SettingsModal v-if="isToShowSettings" :isHotkey="true" />
    </li>
    <li
      :class="
        cn(
          route.name === RouteToName[Routes.ROOM] &&
            'max-full-room-header:hidden',
        )
      "
    >
      <ThemeToggle />
    </li>
  </ul>
</template>

<script setup lang="ts">
import SettingsModal from "@/components/global/settings/modal/SettingsModal.vue";
import ThemeToggle from "@/components/themeToggle/ThemeToggle.vue";
import { Routes, RouteToName } from "@/types/routes";
import { cn } from "@/utils/shadcn/utils";
import { computed } from "vue";
import { useRoute } from "vue-router";
import * as styles from "./AppHeaderActions.css";

const route = useRoute();
const isToShowSettings = computed(() => route.meta.accessType === "auth");
</script>
