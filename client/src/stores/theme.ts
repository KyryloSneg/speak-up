import { LocalStorageKeys } from "@/types/localStorage";
import { usePreferredDark, useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, watchEffect } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const prefersDark = usePreferredDark();
  const selectedTheme = useStorage<"light" | "dark" | null>(
    LocalStorageKeys.THEME,
    null,
  );

  const theme = computed<"light" | "dark">({
    get: () => selectedTheme.value ?? (prefersDark.value ? "dark" : "light"),
    set: value => {
      selectedTheme.value = value;
    },
  });

  function toggleTheme(): "light" | "dark" {
    theme.value = theme.value === "dark" ? "light" : "dark";
    return theme.value;
  }

  watchEffect(() => {
    const currentTheme = theme.value;
    if (document.documentElement.getAttribute("data-theme") === currentTheme) {
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(() =>
        document.documentElement.setAttribute("data-theme", currentTheme),
      );
    } else {
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
  });

  return { theme, toggleTheme };
});
