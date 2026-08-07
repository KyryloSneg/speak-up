<template>
  <div
    :class="
      cn(
        'shadow-lg',
        styles.bgWrapper({
          videoActive,
          type: isScreenSharing ? 'screenSharing' : 'user',
        }),
      )
    "
  >
    <video
      autoplay
      playsinline
      :muted="isMuted || isLocal || !!audioContext"
      :aria-label="videoAriaLabel"
      :class="
        cn(
          styles.bg({
            origin: isLocal ? 'local' : 'remote',
            src: isScreenSharing ? 'screenSharing' : 'userMedia',
          }),
          videoClass,
        )
      "
      ref="video"
    />
  </div>
</template>

<script setup lang="ts">
import useIsVideoActive from "@/composables/useIsVideoActive";
import useStartingUserMedia from "@/composables/useStartingUserMedia";
import { useMediaStore } from "@/stores/media";
import { cn } from "@/utils/shadcn/utils";
import {
  computed,
  onBeforeUnmount,
  ref,
  useTemplateRef,
  watchEffect,
  watchPostEffect,
  type HTMLAttributes,
} from "vue";
import * as styles from "./MediaBg.css";

const props = defineProps<{
  isMuted?: boolean;
  isLocal?: boolean;
  isScreenSharing?: boolean;
  srcObject?: MediaStream | null;
  volume?: number; // 0 => 200
  videoClass?: HTMLAttributes["class"];
  videoAriaLabel?: HTMLAttributes["aria-label"];
}>();

const mediaStore = useMediaStore();
const videoRef = useTemplateRef("video");

const stream = computed(
  () => props.srcObject || (props.isLocal ? mediaStore.userMediaStream : null),
);

const videoActive = useIsVideoActive(stream);
if (props.isLocal) useStartingUserMedia();

function getNodeVolume(volume: number): number {
  return +(volume / 100).toFixed(2);
}

const audioContext = ref<AudioContext | null>(null);
const gainNode = ref<GainNode | null>(null);
const streamSource = ref<MediaStreamAudioSourceNode | null>(null);

watchEffect(onCleanup => {
  const mediaStream = stream.value;

  if (
    props.isMuted ||
    props.isLocal ||
    !mediaStream ||
    mediaStream.getAudioTracks().length === 0
  ) {
    cleanupAudio();
    return;
  }

  if (!audioContext.value) {
    audioContext.value = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }

  const ctx = audioContext.value;
  if (ctx.state === "suspended") ctx.resume();

  const gain = ctx.createGain();
  gain.gain.value =
    props.volume !== undefined ? getNodeVolume(props.volume) : 1;

  const src = ctx.createMediaStreamSource(mediaStream);
  src.connect(gain);
  gain.connect(ctx.destination);

  gainNode.value = gain;
  streamSource.value = src;

  onCleanup(() => {
    src.disconnect();
    gain.disconnect();
    gainNode.value = null;
    streamSource.value = null;
  });
});

watchPostEffect(() => {
  const videoElem = videoRef.value as HTMLVideoElement | undefined;
  if (!videoElem) return;

  videoElem.srcObject = stream.value;
  if (stream.value) videoElem.play(); // just in case
});

watchEffect(() => {
  if (gainNode.value && props.volume !== undefined) {
    gainNode.value.gain.value = getNodeVolume(props.volume);
  }
});

function cleanupAudio() {
  if (streamSource.value) {
    streamSource.value.disconnect();
    streamSource.value = null;
  }

  if (gainNode.value) {
    gainNode.value.disconnect();
    gainNode.value = null;
  }

  if (audioContext.value) {
    audioContext.value.close();
    audioContext.value = null;
  }
}

onBeforeUnmount(cleanupAudio);
</script>
