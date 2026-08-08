import { computed, onMounted, ref } from "vue";

function useModifierKey() {
  const isApple = ref(false);

  onMounted(() => {
    if (typeof window === "undefined") return;
    const userAgentData = (navigator as any).userAgentData?.platform;

    if (userAgentData) {
      isApple.value = ["macOS", "iOS"].includes(userAgentData.platform);
      return;
    }

    const { platform, userAgent, maxTouchPoints } = navigator;
    const isMac =
      /Mac/.test(platform) ||
      /Macintosh/.test(userAgent) ||
      navigator.userAgent.includes("Mac");

    const isMobileApple =
      /iPod|iPhone|iPad/.test(platform) || /iPhone|iPad/.test(userAgent);

    const isIPadOS = platform === "MacIntel" && maxTouchPoints > 0;
    isApple.value = isMac || isMobileApple || isIPadOS;
  });

  const modifierSymbol = computed(() => (isApple.value ? "⌘" : "Ctrl"));
  const modifierName = computed(() => (isApple.value ? "Meta" : "Control"));

  return {
    isApple,
    modifierSymbol,
    modifierName,
  };
}

export default useModifierKey;
