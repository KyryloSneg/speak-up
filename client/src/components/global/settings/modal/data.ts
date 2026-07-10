import SettingsAudioTabContent from "@/components/global/settings/modal/tabs/content/audio/SettingsAudioTabContent.vue";
import SettingsGeneralTabContent from "@/components/global/settings/modal/tabs/content/general/SettingsGeneralTabContent.vue";
import SettingsVideoTabContent from "@/components/global/settings/modal/tabs/content/video/SettingsVideoTabContent.vue";
import type { Component } from "vue";

interface SettingsTabData {
  text: string;
  content: Component;
}

export const settingsTabsData: Record<string, SettingsTabData> = {
  audio: { text: "Audio", content: SettingsAudioTabContent },
  video: { text: "Video", content: SettingsVideoTabContent },
  general: { text: "General", content: SettingsGeneralTabContent },
} as const;
