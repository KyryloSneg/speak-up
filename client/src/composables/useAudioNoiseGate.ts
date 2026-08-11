import { ref, toValue, watchEffect, type MaybeRefOrGetter } from "vue";

export function useAudioNoiseGate(
  streamRef: MaybeRefOrGetter<MediaStream | null>,
  thresholdRef: MaybeRefOrGetter<number> = 1.15,
  holdTimeMsRef: MaybeRefOrGetter<number> = 400,
  floorRef: MaybeRefOrGetter<number> = 0.05,
) {
  const processedStream = ref<MediaStream | null>(null);

  watchEffect(onCleanup => {
    const stream = toValue(streamRef);

    if (!stream) {
      processedStream.value = null;
      return;
    }

    function addTrack(track: MediaStreamTrack): void {
      outputStream.addTrack(track);
      outputStream.dispatchEvent(new CustomEvent("customaddtrack"));
    }

    function removeTrack(track: MediaStreamTrack): void {
      outputStream.removeTrack(track);
      outputStream.dispatchEvent(new CustomEvent("customremovetrack"));
    }

    const outputStream = new MediaStream();
    processedStream.value = outputStream;

    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let bandpass: BiquadFilterNode | null = null;
    let analyser: AnalyserNode | null = null;
    let gainNode: GainNode | null = null;
    let destination: MediaStreamAudioDestinationNode | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    let currentAudioTrack: MediaStreamTrack | null = null;

    const cleanup = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (source) {
        source.disconnect();
        source = null;
      }

      if (bandpass) {
        bandpass.disconnect();
        bandpass = null;
      }

      if (analyser) {
        analyser.disconnect();
        analyser = null;
      }

      if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
      }

      if (destination) {
        destination.stream.getAudioTracks().forEach(removeTrack);
        destination.disconnect();
        destination = null;
      }

      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }

      currentAudioTrack = null;
    };

    const setupAudioGate = (rawAudioTrack: MediaStreamTrack) => {
      cleanup();

      currentAudioTrack = rawAudioTrack;
      audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({
        sampleRate: 48000,
      });

      if (audioCtx.state === "suspended") audioCtx.resume();
      const audioOnlyStream = new MediaStream([rawAudioTrack]);

      source = audioCtx.createMediaStreamSource(audioOnlyStream);
      gainNode = audioCtx.createGain();
      destination = audioCtx.createMediaStreamDestination();

      bandpass = audioCtx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1500;
      bandpass.Q.value = 0.7;

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(bandpass);
      bandpass.connect(analyser);

      source.connect(gainNode);
      gainNode.connect(destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastSpokenAudioTime = 0;

      intervalId = setInterval(() => {
        if (!analyser || !gainNode || !audioCtx) return;

        const threshold = toValue(thresholdRef);
        const holdTimeSec = toValue(holdTimeMsRef) / 1000;
        const gainFloor = toValue(floorRef);
        const now = audioCtx.currentTime;

        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const bytes = dataArray[i];
          if (!bytes) return;

          sum += bytes;
        }

        const speechVolume = sum / dataArray.length;

        if (speechVolume >= threshold) {
          lastSpokenAudioTime = now;
          gainNode.gain.setTargetAtTime(1.0, now, 0.015);
        } else if (now - lastSpokenAudioTime > holdTimeSec) {
          gainNode.gain.setTargetAtTime(gainFloor, now, 0.08);
        }
      }, 20);

      const gatedTrack = destination.stream.getAudioTracks()[0];
      if (gatedTrack) addTrack(gatedTrack);
    };

    const updateTracks = () => {
      const audioTrack = stream.getAudioTracks()[0] || null;
      if (audioTrack !== currentAudioTrack) {
        if (audioTrack) {
          setupAudioGate(audioTrack);
        } else {
          cleanup();
        }
      }

      const videoTracks = stream.getVideoTracks();
      const currentOutputVideoTracks = outputStream.getVideoTracks();

      videoTracks.forEach(track => {
        if (!currentOutputVideoTracks.includes(track)) {
          addTrack(track);
        }
      });

      currentOutputVideoTracks.forEach(track => {
        if (!videoTracks.includes(track)) removeTrack(track);
      });
    };

    updateTracks();

    stream.addEventListener("addtrack", updateTracks);
    stream.addEventListener("removetrack", updateTracks);
    stream.addEventListener("customaddtrack", updateTracks);
    stream.addEventListener("customremovetrack", updateTracks);

    onCleanup(() => {
      stream.removeEventListener("addtrack", updateTracks);
      stream.removeEventListener("removetrack", updateTracks);
      stream.removeEventListener("customaddtrack", updateTracks);
      stream.removeEventListener("customremovetrack", updateTracks);

      cleanup();
      processedStream.value = null;
    });
  });

  return processedStream;
}

export default useAudioNoiseGate;
