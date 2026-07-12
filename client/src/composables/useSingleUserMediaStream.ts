import useSingleUserMediaStreamFallback from "@/composables/useSingleUserMediaStreamFallback";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { storeToRefs } from "pinia";
import { computed, type ComputedRef, type Ref } from "vue";

interface SingleUserMediaStreamData {
  stream: Ref<MediaStream | null | undefined>;
  track:
    | ComputedRef<MediaStreamTrack | null | undefined>
    | Ref<MediaStreamTrack | null | undefined>;
  start: (() => Promise<MediaStream | undefined>) | (() => void);
  stop: () => void;
}

function useSingleUserMediaStream(
  type: "audio" | "video",
  isManual: boolean = false,
): ComputedRef<SingleUserMediaStreamData> {
  const permissionsStore = usePermissionsStore();
  const mediaStore = useMediaStore();

  const fallback = useSingleUserMediaStreamFallback(type, true);

  const result = computed<SingleUserMediaStreamData>(prevResult => {
    let value: SingleUserMediaStreamData;

    const storeRefs = storeToRefs(mediaStore);
    const userMediaStreamValue: SingleUserMediaStreamData = {
      stream: storeRefs.userMediaStream,
      track:
        type === "audio" ? storeRefs.userAudioTrack : storeRefs.userVideoTrack,
      start: mediaStore.start,
      stop: mediaStore.stop,
    } as const;

    const micOrCamStr = type === "audio" ? "microphone" : "camera";
    const micsOrCamsStr = `${micOrCamStr}s` as const;

    const isGranted = permissionsStore[micOrCamStr] === "granted";
    const areDevicesFetched = mediaStore[micsOrCamsStr].length !== 0;

    if (mediaStore.hasStartedMedia && mediaStore.config[type]) {
      value = userMediaStreamValue;

      if (!isManual) {
        userMediaStreamValue.start();
        fallback.stop();
      }
    } else {
      value = fallback;

      if (!isManual && isGranted && areDevicesFetched) {
        fallback.start();
      }
    }

    return value;
  });

  return result;
}

export default useSingleUserMediaStream;
