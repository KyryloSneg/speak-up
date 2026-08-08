<template>
  <section :class="baseStyles.section">
    <h4 :class="baseStyles.heading">App hotkeys</h4>
    <dl :class="styles.list">
      <div
        v-for="item in dataWithProperModifierKey"
        :class="styles.listItem"
        :key="item.hotkey"
      >
        <dt>{{ item.label }}</dt>
        <dd>
          <UIKbd>{{ item.hotkey }}</UIKbd>
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { hotkeysData } from "@/components/global/settings/modal/tabs/content/general/hotkeys/data";
import UIKbd from "@/components/ui/shadcn/kbd/UIKbd.vue";
import useModifierKey from "@/composables/useModifierKey";
import { computed } from "vue";
import * as baseStyles from "../SettingsGeneralTabContent.css";
import * as styles from "./SettingsGeneralTabHotkeys.css";

const { modifierSymbol } = useModifierKey();
const dataWithProperModifierKey = computed(() =>
  hotkeysData.map(data => ({
    ...data,
    hotkey: data.hotkey.replace("Ctrl", modifierSymbol.value),
  })),
);
</script>
