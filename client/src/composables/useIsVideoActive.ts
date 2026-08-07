import { ref, toValue, watchEffect, type MaybeRefOrGetter } from "vue";

function useIsVideoActive(
  streamRefOrGetter: MaybeRefOrGetter<MediaStream | null | undefined>,
) {
  const isVideoActive = ref(false);

  watchEffect(onCleanup => {
    const stream = toValue(streamRefOrGetter);
    if (!stream) {
      isVideoActive.value = false;
      return;
    }

    const cleanups: Array<() => void> = [];

    function updateEventListeners(): void {
      cleanups.forEach(cleanup => cleanup());
      const stream = toValue(streamRefOrGetter);

      if (!stream) {
        isVideoActive.value = false;
        return;
      }

      const videoTracks = stream.getVideoTracks();
      const updateState = () => {
        isVideoActive.value = videoTracks.some(
          track => !track.muted && track.enabled && track.readyState === "live",
        );
      };

      updateState();

      videoTracks.forEach(track => {
        track.addEventListener("mute", updateState);
        track.addEventListener("unmute", updateState);
        track.addEventListener("enable", updateState);
        track.addEventListener("disable", updateState);
        track.addEventListener("ended", updateState);

        cleanups.push(() => {
          track.removeEventListener("mute", updateState);
          track.removeEventListener("unmute", updateState);
          track.removeEventListener("enable", updateState);
          track.removeEventListener("disable", updateState);
          track.removeEventListener("ended", updateState);
        });
      });
    }

    updateEventListeners();

    stream.addEventListener("addtrack", updateEventListeners);
    stream.addEventListener("removetrack", updateEventListeners);
    stream.addEventListener("customaddtrack", updateEventListeners);
    stream.addEventListener("customremovetrack", updateEventListeners);

    onCleanup(() => {
      cleanups.forEach(cleanup => cleanup());

      stream.removeEventListener("addtrack", updateEventListeners);
      stream.removeEventListener("removetrack", updateEventListeners);
      stream.removeEventListener("customaddtrack", updateEventListeners);
      stream.removeEventListener("customremovetrack", updateEventListeners);
    });
  });

  return isVideoActive;
}

export default useIsVideoActive;
