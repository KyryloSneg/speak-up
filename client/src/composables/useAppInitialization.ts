import useAuthMediaDevicesInitialization from "@/composables/useAuthMediaDevicesInitialization";
import useCleanups from "@/composables/useCleanups";
import useRoomBeforeUnload from "@/composables/useRoomBeforeUnload";
import useUserSynchronization from "@/composables/useUserSynchronization";

function useAppInitialization() {
  useUserSynchronization();
  useAuthMediaDevicesInitialization();
  useRoomBeforeUnload();
  useCleanups();
}

export default useAppInitialization;
