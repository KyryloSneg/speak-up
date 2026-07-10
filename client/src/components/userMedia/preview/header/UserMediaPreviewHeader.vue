<template>
  <div :class="styles.wrapper">
    <dl :class="cn(styles.nicknameWrapper, 'shadow-xs select-none')">
      <dt class="sr-only">Your nickname</dt>
      <dd :class="cn(styles.nickname, 'truncate')">
        {{ authStore.user?.nickname }}
      </dd>
    </dl>
    <SettingsModal :triggerProps="{ size: 'icon-lg', variant: 'secondary' }" />
  </div>
</template>

<script setup lang="ts">
import SettingsModal from "@/components/global/settings/modal/SettingsModal.vue";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/utils/shadcn/utils";
import * as styles from "./UserMediaPreviewHeader.css";

const authStore = useAuthStore();
</script>
