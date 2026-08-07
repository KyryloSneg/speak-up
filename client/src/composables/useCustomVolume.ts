import { useLocalStorage } from "@vueuse/core";

function useCustomVolume(userId: string, type: "user" | "screenSharing") {
  const volume = useLocalStorage(`${userId}-${type}`, [100]);
  return volume;
}

export default useCustomVolume;
