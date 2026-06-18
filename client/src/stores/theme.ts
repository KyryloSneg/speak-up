import { LocalStorageKeys } from "@/types/localStorage";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { watchEffect } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const theme = useStorage<"light" | "dark">(LocalStorageKeys.THEME, "light");

  function toggleTheme(): "light" | "dark" {
    theme.value = theme.value === "dark" ? "light" : "dark";
    return theme.value;
  }

  watchEffect(() => {
    if (!["light", "dark"].includes(theme.value)) theme.value = "light";

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        theme.value = theme.value;
        document.documentElement.setAttribute("data-theme", theme.value);
      });
    } else {
      document.documentElement.setAttribute("data-theme", theme.value);
    }
  });

  return { theme, toggleTheme };
});
