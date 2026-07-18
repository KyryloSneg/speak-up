import useAuthMediaDevicesInitialization from "@/composables/useAuthMediaDevicesInitialization";
import useIsJoiningRoomCleanup from "@/composables/useIsJoiningRoomCleanup";
import useRoomBeforeUnload from "@/composables/useRoomBeforeUnload";
import useUserSynchronization from "@/composables/useUserSynchronization";

function useAppInitialization() {
  useUserSynchronization();
  useAuthMediaDevicesInitialization();
  useRoomBeforeUnload();
  useIsJoiningRoomCleanup();
}

export default useAppInitialization;
