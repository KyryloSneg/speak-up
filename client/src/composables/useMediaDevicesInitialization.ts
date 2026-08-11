import useGettingAllMediaDevices from "@/composables/useGettingAllMediaDevices";
import useGettingDefaultCamera from "@/composables/useGettingDefaultCamera";
import useGettingMediaPermissions from "@/composables/useGettingMediaPermissions";
import useSendingNewMediaConfig from "@/composables/useSendingNewMediaConfig";
import useSendingWebRTCUserMedia from "@/composables/useSendingWebRTCUserMedia";
import useStoppingUserMediaOnPermissionsDeny from "@/composables/useStoppingUserMediaOnPermissionsDeny";
import useStoreUserMediaStreamCleanup from "@/composables/useStoreUserMediaStreamCleanup";
import useSyncMediaConfigWithStream from "@/composables/useSyncMediaConfigWithStream";
import useSyncPermissionsWithMediaConfig from "@/composables/useSyncPermissionsWithMediaConfig";
import useSyncSelectedDevicesWithUserMedia from "@/composables/useSyncSelectedDevicesWithUserMedia";
import useSyncStoreUserTrack from "@/composables/useSyncStoreUserTrack";
import useSyncStreamIsCameraFlipped from "@/composables/useSyncStreamIsCameraFlipped";

function useMediaDevicesInitialization() {
  useGettingMediaPermissions();
  useGettingAllMediaDevices();
  useGettingDefaultCamera();

  useSyncMediaConfigWithStream();
  useSyncPermissionsWithMediaConfig();
  useSyncSelectedDevicesWithUserMedia();
  useSyncStreamIsCameraFlipped();

  useSyncStoreUserTrack("audio");
  useSyncStoreUserTrack("video");

  useSendingNewMediaConfig();
  useSendingWebRTCUserMedia();
  useStoppingUserMediaOnPermissionsDeny();

  useStoreUserMediaStreamCleanup();
}

export default useMediaDevicesInitialization;
