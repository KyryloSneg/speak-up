import { useThemeStore } from "@/stores/theme";
import { LocalStorageKeys } from "@/types/localStorage";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

describe("themeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("should set light theme as a default one", async () => {
    const themeStore = useThemeStore();
    expect(themeStore.theme).toBe("light");

    await expect
      .poll(() => localStorage.getItem(LocalStorageKeys.THEME))
      .toBe(null);
  });

  it("should set dark theme as a default one if localStorage's theme is dark as well", () => {
    localStorage.setItem(LocalStorageKeys.THEME, "dark");
    const themeStore = useThemeStore();

    expect(themeStore.theme).toBe("dark");
  });

  it("should properly toggle theme twice", async () => {
    const themeStore = useThemeStore();
    const firstToggleThemeResult = themeStore.toggleTheme();

    expect(firstToggleThemeResult).toBe("dark");
    expect(themeStore.theme).toBe(firstToggleThemeResult);
    await expect
      .poll(() => localStorage.getItem(LocalStorageKeys.THEME))
      .toBe(firstToggleThemeResult);

    const secToggleThemeResult = themeStore.toggleTheme();

    expect(secToggleThemeResult).toBe("light");
    expect(themeStore.theme).toBe(secToggleThemeResult);
    await expect
      .poll(() => localStorage.getItem(LocalStorageKeys.THEME))
      .toBe(secToggleThemeResult);
  });
});
