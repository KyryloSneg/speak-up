import useAuthMediaDevicesInitialization from "@/composables/useAuthMediaDevicesInitialization";
import useUserSynchronization from "@/composables/useUserSynchronization";

function useAppInitialization() {
  useUserSynchronization();
  useAuthMediaDevicesInitialization();
}

export default useAppInitialization;
