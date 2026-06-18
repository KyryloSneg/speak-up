import $api from "@/http";
import { LocalStorageKeys } from "@/types/localStorage";
import type { UserDto } from "@speak-up/shared";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<UserDto | null>(null);
  const isInitialized = ref(false);
  const isGettingInitialized = ref(false);
  const isAuth = computed(() => !!user.value);

  async function initAuth() {
    if (isGettingInitialized.value || isInitialized.value) return;

    try {
      isGettingInitialized.value = true;
      const { data } = await $api.auth.refresh();

      if (data) {
        user.value = data.user;
        localStorage.setItem(
          LocalStorageKeys.ACCESS_TOKEN,
          data.tokens.accessToken,
        );
      }
    } finally {
      // put it inside finally just in case. we can put an error-throwable code
      // above and forget about this line
      isGettingInitialized.value = false;
      isInitialized.value = true;
    }
  }

  return { user, isAuth, isGettingInitialized, isInitialized, initAuth };
});
