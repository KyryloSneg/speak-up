<template>
  <UITabs
    orientation="vertical"
    :defaultValue="Object.keys(settingsTabsData)[0]"
    :class="styles.tabs"
  >
    <UITabsList :class="styles.list">
      <UITabsTrigger
        class="text-lg"
        v-for="(value, key) in settingsTabsData"
        :value="key"
        :key="key"
      >
        {{ value.text }}
      </UITabsTrigger>
    </UITabsList>
    <UITabsContent
      v-for="(value, key) in settingsTabsData"
      :value="key"
      :class="styles.content"
      :key="key"
    >
      <component :is="value.content" />
    </UITabsContent>
  </UITabs>
</template>

<script setup lang="ts">
import { settingsTabsData } from "@/components/global/settings/modal/data";
import {
  UITabs,
  UITabsContent,
  UITabsList,
  UITabsTrigger,
} from "@/components/ui/shadcn/tabs";
import * as styles from "./SettingsModalTab.css";
</script>
