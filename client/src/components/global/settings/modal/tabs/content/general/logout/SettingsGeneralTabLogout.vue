<template>
  <UIButton
    size="lg"
    variant="destructive"
    :class="styles.button"
    :disabled="isLoading"
    @click="click"
  >
    Log out of the account <User />
  </UIButton>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import handleLogout from "@/utils/handleLogout";
import { User } from "@lucide/vue";
import { ref } from "vue";
import * as styles from "./SettingsGeneralTabLogout.css";

const isLoading = ref();

async function click(): Promise<void> {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    await handleLogout();
  } catch {
  } finally {
    isLoading.value = false;
  }
}
</script>
