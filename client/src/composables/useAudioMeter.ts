import { onScopeDispose, ref, watch } from "vue";
import { toast } from "vue-sonner";

function useAudioMeter(
  getAudioTrack: () => MediaStreamTrack | null | undefined,
) {
  const volume = ref(0);
  const activeAudioTrack = ref<MediaStreamTrack | null>(null);

  let internalVolume = 0;

  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let animationFrameId: number | null = null;

  function cleanupNodes() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (source) {
      source.disconnect();
      source = null;
    }

    if (analyser) {
      analyser.disconnect();
      analyser = null;
    }

    volume.value = 0;
    internalVolume = 0;
  }

  function cleanupAll() {
    cleanupNodes();

    if (audioContext && audioContext.state !== "closed") {
      audioContext.close();
      audioContext = null;
    }

    activeAudioTrack.value = null;
  }

  function init() {
    cleanupNodes();

    // new track gets pushed to the end of the array
    const audioTrack = getAudioTrack();
    if (!audioTrack) return;

    if (!audioTrack) return;
    if (audioTrack.id === activeAudioTrack.value?.id) return;

    if (!audioContext || audioContext.state === "closed") {
      audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    if (audioContext.state === "suspended") audioContext.resume();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    try {
      const stream = new MediaStream([audioTrack]);

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      activeAudioTrack.value = audioTrack;
    } catch (e) {
      toast.error((e as Error).message);
      console.error("Couldn't bind media stream source", e);

      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function updateVolume() {
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);

      let total = 0;
      for (let i = 0; i < bufferLength; i++) {
        const bytes = dataArray[i];
        if (!bytes) continue;

        total += bytes;
      }

      const average = total / bufferLength;
      const targetVolume = Math.min(Math.round((average / 150) * 100), 100);

      if (targetVolume > internalVolume) {
        internalVolume = targetVolume;
      } else {
        internalVolume = internalVolume * 0.8 + targetVolume * 0.2;
      }

      if (internalVolume < 0.5) internalVolume = 0;

      volume.value = Math.round(internalVolume);
      animationFrameId = requestAnimationFrame(updateVolume);
    }

    updateVolume();
  }

  onScopeDispose(cleanupAll);
  watch(getAudioTrack, init, { immediate: true });

  return { volume };
}

export default useAudioMeter;
