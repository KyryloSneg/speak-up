import useGettingAllMediaDevices from "@/composables/useGettingAllMediaDevices";
import useGettingDefaultCamera from "@/composables/useGettingDefaultCamera";
import useGettingMediaPermissions from "@/composables/useGettingMediaPermissions";
import useSendingNewMediaConfig from "@/composables/useSendingNewMediaConfig";
import useStoppingUserMediaOnPermissionsDeny from "@/composables/useStoppingUserMediaOnPermissionsDeny";
import useStoreUserAudioTrackCleanup from "@/composables/useStoreUserAudioTrackCleanup";
import useStoreUserMediaStreamCleanup from "@/composables/useStoreUserMediaStreamCleanup";
import useSyncMediaConfigWithStream from "@/composables/useSyncMediaConfigWithStream";
import useSyncPermissionsWithMediaConfig from "@/composables/useSyncPermissionsWithMediaConfig";
import useSyncSelectedDevicesWithUserMedia from "@/composables/useSyncSelectedDevicesWithUserMedia";
import useSyncStreamIsCameraFlipped from "@/composables/useSyncStreamIsCameraFlipped";

function useMediaDevicesInitialization() {
  useGettingMediaPermissions();
  useGettingAllMediaDevices();
  useGettingDefaultCamera();

  useSyncMediaConfigWithStream();
  useSyncPermissionsWithMediaConfig();
  useSyncSelectedDevicesWithUserMedia();
  useSyncStreamIsCameraFlipped();

  useSendingNewMediaConfig();
  useStoppingUserMediaOnPermissionsDeny();

  useStoreUserMediaStreamCleanup();
  useStoreUserAudioTrackCleanup();
}

export default useMediaDevicesInitialization;
