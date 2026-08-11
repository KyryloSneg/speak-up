type ScreenShareMode = "motion" | "detail";

interface AutoOptimizerOptions {
  intervalMs?: number;
  width?: number;
  height?: number;
  lowMotionThreshold?: number; // "detail" motion score
}

type Cleanup = () => void;

const optimizedTracks = new Map<
  MediaStreamTrack["id"],
  { senders: Set<RTCRtpSender>; intervalId?: NodeJS.Timeout }
>();

function startOptimizingScreenSharingVideo(
  track: MediaStreamTrack,
  sender: RTCRtpSender,
  options: AutoOptimizerOptions = {},
): Cleanup {
  const {
    intervalMs = 500,
    width = 32,
    height = 18,
    lowMotionThreshold = 0.06,
  } = options;

  if (!window.OffscreenCanvas) return () => {};

  const cleanup = () => {
    const trackInfo = optimizedTracks.get(track.id);

    clearInterval(trackInfo?.intervalId);
    optimizedTracks.delete(track.id);

    if (videoElem) {
      videoElem.pause();
      videoElem.srcObject = null;
      videoElem.remove();
    }
  };

  const initTrackInfo = optimizedTracks.get(track.id);

  if (initTrackInfo) {
    initTrackInfo.senders.add(sender);
    return cleanup;
  } else {
    optimizedTracks.set(track.id, { senders: new Set([sender]) });
  }

  let currentMode: ScreenShareMode | undefined;
  let prevFrameData: Uint8ClampedArray | null = null;

  let smoothedMotionScore = 0;
  let staticFrameCount = 0;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) return cleanup;
  const videoElem = document.createElement("video");

  videoElem.srcObject = new MediaStream([track]);
  videoElem.muted = true;
  videoElem.playsInline = true;

  videoElem.play().catch(() => {});

  async function setMode(newMode: ScreenShareMode) {
    if (currentMode === newMode) return;
    currentMode = newMode;

    track.contentHint = newMode;

    async function setParams(sender: RTCRtpSender): Promise<void> {
      try {
        const params = sender.getParameters();
        params.degradationPreference =
          newMode === "motion" ? "maintain-framerate" : "maintain-resolution";

        if (!params.encodings || params.encodings.length === 0) {
          params.encodings = [{}];
        }

        if (newMode === "motion") {
          params.encodings[0]!.maxBitrate = 5000000;
          params.encodings[0]!.scaleResolutionDownBy = 1.25;
          params.encodings[0]!.maxFramerate = 60;
        } else {
          params.encodings[0]!.maxBitrate = 2500000;
          params.encodings[0]!.scaleResolutionDownBy = 1.0;
          params.encodings[0]!.maxFramerate = 30;
        }

        await sender.setParameters(params);
      } catch (e) {
        console.warn("Failed to update sender parameters:", e);
      }
    }

    const trackInfo = optimizedTracks.get(track.id);
    if (trackInfo) {
      await Promise.allSettled(Array.from(trackInfo.senders).map(setParams));
    }
  }

  setMode("motion");

  const intervalId = setInterval(() => {
    if (videoElem.readyState < 2) return; // wait until data is loaded
    const trackInfo = optimizedTracks.get(track.id);

    if (trackInfo) {
      trackInfo.senders = new Set(
        Array.from(trackInfo.senders).filter(
          sender => sender.transport?.state !== "closed",
        ),
      );

      if (!trackInfo.senders.size) {
        cleanup();
        return;
      }
    }

    ctx.drawImage(videoElem, 0, 0, width, height);
    const currentFrame = ctx.getImageData(0, 0, width, height).data;

    if (prevFrameData) {
      let changedPixels = 0;
      const sampledPixels = currentFrame.length / 16;

      for (let i = 0; i < currentFrame.length; i += 16) {
        const r = currentFrame[i];
        const g = currentFrame[i + 1];
        const b = currentFrame[i + 2];

        const prevR = prevFrameData[i];
        const prevG = prevFrameData[i + 1];
        const prevB = prevFrameData[i + 2];

        if (
          r === undefined ||
          g === undefined ||
          b === undefined ||
          prevR === undefined ||
          prevG === undefined ||
          prevB === undefined
        ) {
          continue;
        }

        const diffR = Math.abs(r - prevR);
        const diffG = Math.abs(g - prevG);
        const diffB = Math.abs(b - prevB);

        if (diffR + diffG + diffB > 35) changedPixels++;
      }

      const rawMotionScore = changedPixels / sampledPixels;
      smoothedMotionScore = smoothedMotionScore * 0.7 + rawMotionScore * 0.3;

      if (smoothedMotionScore < lowMotionThreshold) {
        staticFrameCount++;

        if (staticFrameCount >= 3 && currentMode !== "detail") {
          setMode("detail");
        }
      } else {
        staticFrameCount = 0;
        if (currentMode !== "motion") setMode("motion");
      }
    }

    prevFrameData = currentFrame;
  }, intervalMs);

  const trackInfo = optimizedTracks.get(track.id);
  if (trackInfo) trackInfo.intervalId = intervalId;

  track.addEventListener("ended", cleanup, { once: true });
  return cleanup;
}

export default startOptimizingScreenSharingVideo;
