<template>
  <UIButton
    @click="themeStore.toggleTheme"
    :aria-label="`Toggle ${isDarkTheme ? 'light' : 'dark'} theme`"
    size="icon"
    variant="outline"
  >
    <MoonIcon v-if="isDarkTheme" />
    <SunIcon v-else />
  </UIButton>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { useThemeStore } from "@/stores/theme";
import { MoonIcon, SunIcon } from "@lucide/vue";
import { computed } from "vue";

const themeStore = useThemeStore();
const isDarkTheme = computed(() => themeStore.theme === "dark");
</script>
