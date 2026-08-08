<template>
  <section :class="cn(baseStyles.base, styles.rootSection)">
    <h3 class="sr-only">General</h3>
    <SettingsGeneralTabChangeNickname />
    <SettingsGeneralTabHotkeys />
    <!-- TODO: theme + logout -->
  </section>
</template>

<script setup lang="ts">
import SettingsGeneralTabChangeNickname from "@/components/global/settings/modal/tabs/content/general/changeNickname/SettingsGeneralTabChangeNickname.vue";
import SettingsGeneralTabHotkeys from "@/components/global/settings/modal/tabs/content/general/hotkeys/SettingsGeneralTabHotkeys.vue";
import { cn } from "@/utils/shadcn/utils";
import * as baseStyles from "../base.css";
import * as styles from "./SettingsGeneralTabContent.css";
</script>
