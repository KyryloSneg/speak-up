import useMediaDevicesInitialization from "@/composables/useMediaDevicesInitialization";
import { ref, watchEffect } from "vue";
import { useRoute } from "vue-router";

function useAuthMediaDevicesInitialization() {
  const route = useRoute();
  const isInitialized = ref(false);

  watchEffect(() => {
    if (isInitialized.value) return;
    if (route.meta.accessType === "auth") {
      useMediaDevicesInitialization();
      isInitialized.value = true;
    }
  });
}

export default useAuthMediaDevicesInitialization;
