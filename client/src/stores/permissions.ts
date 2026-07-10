import { defineStore } from "pinia";
import { ref } from "vue";

export const usePermissionsStore = defineStore("permissions", () => {
  const microphone = ref<PermissionState>("prompt");
  const camera = ref<PermissionState>("prompt");

  return { microphone, camera };
});
