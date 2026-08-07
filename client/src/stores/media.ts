import useAudioNoiseGate from "@/composables/useAudioNoiseGate";
import useIsVideoActive from "@/composables/useIsVideoActive";
import MediaDevice, {
  type StartUserMediaOnError,
} from "@/services/MediaDevice";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { useWebRTCStore } from "@/stores/webrtc";
import {
  FacingModes,
  type RoomMediaConfigs,
  type RoomMediaConfigUserId,
} from "@/types/media";
import { MediaDeviceEvents } from "@/types/mediaDeviceEvents";
import { mediaDevice } from "@/utils/mediaDevice";
import socket from "@/utils/socket";
import {
  SocketEvents,
  SocketResponseEvents,
  type SocketMediaConfig,
} from "@speak-up/shared";
import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { toast } from "vue-sonner";

export const useMediaStore = defineStore("media", () => {
  const devices = ref<MediaDeviceInfo[]>([]);
  const rawUserMediaStream = shallowRef<MediaDevice["userMediaStream"] | null>(
    null,
  );

  const screenSharingStream = shallowRef<
    MediaDevice["screenSharingStream"] | null
  >(null);

  const userAudioTrack = shallowRef<MediaStreamTrack | null>(null);
  const userVideoTrack = shallowRef<MediaStreamTrack | null>(null);

  const config = ref<SocketMediaConfig>({ audio: true, video: true });
  const isCameraFlipped = ref(false);
  const roomConfigs = ref<RoomMediaConfigs | null>(null);
  const hasStartedMedia = ref(false);

  function bindEvents(): void {
    socket
      .off(SocketResponseEvents.SEND_MEDIA_CONFIG)
      .on(SocketResponseEvents.SEND_MEDIA_CONFIG, data =>
        toast.error(data.error),
      );

    socket
      .off(SocketEvents.RECEIVED_MEDIA_CONFIG)
      .on(SocketEvents.RECEIVED_MEDIA_CONFIG, data => {
        if (!roomConfigs.value) return;

        const typedUserId = data.userId as RoomMediaConfigUserId;
        roomConfigs.value.set(typedUserId, {
          userId: typedUserId,
          ...data.config,
        });
      });
  }

  function sendMediaConfig(config: SocketMediaConfig): void {
    socket.emit(SocketEvents.SEND_MEDIA_CONFIG, { config });
  }

  function toggleMic(value: boolean | null = null): void {
    config.value.audio =
      typeof value === "boolean" ? value : !config.value.audio;
  }

  function toggleCamera(value: boolean | null = null): void {
    config.value.video =
      typeof value === "boolean" ? value : !config.value.video;
  }

  function flipCamera(value: boolean | null = null): void {
    isCameraFlipped.value =
      typeof value === "boolean" ? value : !isCameraFlipped.value;
  }

  function updateDevices(
    prevSelectedDevices:
      | ReturnType<typeof useMediaSettingsStore>["selectedDevices"]
      | { microphone?: string | null; camera?: string | null },
  ): void {
    if (!hasStartedMedia.value) {
      start();
      return;
    }

    if (!config.value.audio && !config.value.video) return;

    const onError: StartUserMediaOnError = info => {
      toast.error(info.message);
    };

    const mediaSettingsStore = useMediaSettingsStore();
    const { microphone: newAudio, camera: origNewVideo } =
      mediaSettingsStore.selectedDevices;

    const newVideo =
      origNewVideo === mediaSettingsStore.defaultCamera
        ? "default"
        : origNewVideo;

    // request only the device user selected
    const audio =
      newAudio !== prevSelectedDevices.microphone ? newAudio : undefined;

    const video =
      newVideo !== prevSelectedDevices.camera ? newVideo : undefined;

    mediaDevice.changeDeviceId({ audio, video }, onError);
  }

  function start(): void {
    if (hasStartedMedia.value) return;
    if (!config.value.audio && !config.value.video) return;

    hasStartedMedia.value = true;

    let errorsAmount = 0;
    const maxErrorsAmount = Object.values(config.value).reduce(
      (acc, curr) => (curr ? acc + 1 : acc),
      0,
    );

    const onError: StartUserMediaOnError = info => {
      errorsAmount++;

      toast.error(info.message);
      // reset only if all requested tracks have failed to start
      if (errorsAmount === maxErrorsAmount) hasStartedMedia.value = false;
    };

    const mediaSettingsStore = useMediaSettingsStore();
    const { microphone: selectedMic, camera: selectedCamera } =
      mediaSettingsStore.selectedDevices;

    // always provide fake "default" instead of the actual default camera id
    // (replacing "default" with the actual default camera id is unwanted in the
    // future, so we do this hack)
    // ("default" is relevant only for the mic, not for the camera)
    const selectedCameraToUse =
      selectedCamera === mediaSettingsStore.defaultCamera
        ? "default"
        : selectedCamera;

    mediaDevice
      .off(MediaDeviceEvents.USER_MEDIA_STREAM)
      .on(MediaDeviceEvents.USER_MEDIA_STREAM, stream => {
        const typedStream = stream as MediaDevice["userMediaStream"];
        rawUserMediaStream.value = typedStream;

        userVideoTrack.value =
          rawUserMediaStream.value?.getVideoTracks()[0] || null;
      });

    const audioConstraints: MediaTrackConstraints = {
      deviceId: {
        [selectedMic === "default" ? "ideal" : "exact"]: selectedMic,
      },
    } as const;

    const videoConstraints: MediaTrackConstraints = {
      deviceId: {
        [selectedCameraToUse === "default" ? "ideal" : "exact"]:
          selectedCameraToUse,
      },
      facingMode: isCameraFlipped.value
        ? FacingModes.ENVIRONMENT
        : FacingModes.USER,
    } as const;

    // start audio and video as separate tracks. this helps in situations when a
    // specific track (A) fails and the second one (B) isn't, so track A error
    // doesn't disrupt track B

    // audio
    mediaDevice.startUserMedia(
      { audio: config.value.audio, video: false },
      {
        audioConstraints,
        onError,
      },
    );

    // video
    mediaDevice.startUserMedia(
      { audio: false, video: config.value.video },
      {
        videoConstraints,
        onError,
      },
    );
  }

  function startScreenSharing(): void {
    mediaDevice
      .off(MediaDeviceEvents.SCREEN_SHARING_STREAM)
      .on(MediaDeviceEvents.SCREEN_SHARING_STREAM, stream => {
        const typedStream = stream as MediaDevice["screenSharingStream"];
        screenSharingStream.value = typedStream;

        const webRTCStore = useWebRTCStore();
        webRTCStore.sendScreenSharing(typedStream);
      });

    mediaDevice.startScreenSharing(info => toast.error(info.message));
  }

  function stopScreenSharing(): void {
    mediaDevice.stopScreenSharing();
  }

  function stop(): void {
    hasStartedMedia.value = false;

    stopScreenSharing();
    mediaDevice.stop();
  }

  const userMediaStream = useAudioNoiseGate(rawUserMediaStream);
  const microphones = computed(() =>
    devices.value.filter(device => device?.kind === "audioinput"),
  );

  const cameras = computed(() =>
    devices.value.filter(device => device?.kind === "videoinput"),
  );

  const isSharingScreen = useIsVideoActive(screenSharingStream);

  return {
    devices,
    rawUserMediaStream,
    screenSharingStream,
    userAudioTrack,
    userVideoTrack,
    config,
    isCameraFlipped,
    roomConfigs,
    hasStartedMedia,
    userMediaStream,
    microphones,
    cameras,
    isSharingScreen,
    bindEvents,
    sendMediaConfig,
    toggleMic,
    toggleCamera,
    flipCamera,
    updateDevices,
    start,
    startScreenSharing,
    stopScreenSharing,
    stop,
  };
});
