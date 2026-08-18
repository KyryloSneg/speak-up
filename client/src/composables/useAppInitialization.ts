import useAuthMediaDevicesInitialization from "@/composables/useAuthMediaDevicesInitialization";
import useCleanups from "@/composables/useCleanups";
import useRemoteScreenSharingsAutoCleanup from "@/composables/useRemoteScreenSharingsAutoCleanup";
import useRequestingFullScreen from "@/composables/useRequestingFullScreen";
import useRoomBeforeUnload from "@/composables/useRoomBeforeUnload";
import useScreenSharingAutoPin from "@/composables/useScreenSharingAutoPin";
import useSyncSharingScreenAnnouncerText from "@/composables/useSyncSharingScreenAnnouncerText";
import useUserSynchronization from "@/composables/useUserSynchronization";

function useAppInitialization() {
  useUserSynchronization();
  useAuthMediaDevicesInitialization();
  useRoomBeforeUnload();
  useRemoteScreenSharingsAutoCleanup();
  useScreenSharingAutoPin();
  useRequestingFullScreen();
  useSyncSharingScreenAnnouncerText();
  useCleanups();
}

export default useAppInitialization;
