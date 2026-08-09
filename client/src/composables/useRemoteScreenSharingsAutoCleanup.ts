import { useWebRTCStore } from "@/stores/webrtc";
import {
  computed,
  effectScope,
  type EffectScope,
  ref,
  watch,
  watchEffect,
} from "vue";
import useIsVideoActive from "./useIsVideoActive";

function useRemoteScreenSharingsAutoCleanup() {
  const webRTCStore = useWebRTCStore();
  const streamScopes = ref<Map<MediaStream, EffectScope>>(new Map());

  const streams = computed(() =>
    Array.from(webRTCStore.remoteStreams.values())
      .map(remoteStream => remoteStream.screenSharing)
      .filter((stream): stream is MediaStream => !!stream),
  );

  watch(
    streams,
    value => {
      const uniqueStreamSet = new Set(value);

      for (const [stream, scope] of streamScopes.value.entries()) {
        if (!uniqueStreamSet.has(stream)) {
          scope.stop();
          streamScopes.value.delete(stream);
        }
      }

      for (const stream of value) {
        if (!streamScopes.value.has(stream)) {
          const scope = effectScope();

          scope.run(() => {
            const isActive = useIsVideoActive(stream);

            watchEffect(onCleanup => {
              if (isActive.value) return;

              const videoTracks = stream.getVideoTracks();
              const isEnded =
                videoTracks.length === 0 ||
                videoTracks.every(track => track.readyState === "ended");

              const cleanup = () => {
                const remoteStream = Array.from(
                  webRTCStore.remoteStreams.values(),
                ).find(item => item.screenSharing === stream);

                if (remoteStream) remoteStream.screenSharing = null;
              };

              if (isEnded) {
                cleanup();
                return;
              }

              // mostly, we get here

              // if the stream is inactive even after 2.5 seconds, consider it as a
              // stopped one
              const timeoutId = setTimeout(cleanup, 2500);
              onCleanup(() => clearTimeout(timeoutId));
            });
          });

          streamScopes.value.set(stream, scope);
        }
      }
    },
    { immediate: true, deep: true },
  );
}

export default useRemoteScreenSharingsAutoCleanup;
