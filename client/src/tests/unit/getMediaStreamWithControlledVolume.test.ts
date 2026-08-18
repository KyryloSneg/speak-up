import setupFakeBrowserAudioContext from "@/tests/utils/setupFakeBrowserAudioContext";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import getMediaStreamWithControlledVolume from "@/utils/getMediaStreamWithControlledVolume";
import { beforeEach, describe, expect, it } from "vitest";

describe("getMediaStreamWithControlledVolume", () => {
  beforeEach(() => {
    setupFakeBrowserMediaEngine();
    setupFakeBrowserAudioContext();
  });

  it("should return early with original stream and null references if stream has no audio tracks", () => {
    const videoTrack = new MediaStreamTrack();
    (videoTrack as any).kind = "video";

    const initStream = new MediaStream([videoTrack]);
    const result = getMediaStreamWithControlledVolume(initStream);

    expect(result.mediaStream).toBe(initStream);
    expect(result.ctx).toBeNull();
    expect(result.gainNode).toBeNull();
    expect(result.changeVolume).toBeNull();
  });

  it("should initialize AudioContext, gainNode, and set initial volume to 1", () => {
    const audioTrack = new MediaStreamTrack();
    (audioTrack as any).kind = "audio";

    const initStream = new MediaStream([audioTrack]);
    const result = getMediaStreamWithControlledVolume(initStream);

    expect(result.ctx).not.toBeNull();
    expect(result.gainNode).not.toBeNull();
    expect(result.gainNode?.gain.value).toBe(1);
    expect(result.changeVolume).toBeTypeOf("function");
  });

  it("should apply custom initVolume if provided", () => {
    const audioTrack = new MediaStreamTrack();
    (audioTrack as any).kind = "audio";

    const initStream = new MediaStream([audioTrack]);
    const result = getMediaStreamWithControlledVolume(initStream, 0.45);

    expect(result.gainNode?.gain.value).toBe(0.45);
  });

  it("should update gain value when changeVolume is called", () => {
    const audioTrack = new MediaStreamTrack();
    (audioTrack as any).kind = "audio";

    const initStream = new MediaStream([audioTrack]);
    const { changeVolume, gainNode } = getMediaStreamWithControlledVolume(
      initStream,
      0.2,
    );

    expect(gainNode?.gain.value).toBe(0.2);
    changeVolume!(0.85);

    expect(gainNode?.gain.value).toBe(0.85);
  });

  it("should preserve video tracks from input stream and attach processed audio track from destination", () => {
    const audioTrack = new MediaStreamTrack();
    const videoTrack = new MediaStreamTrack();

    (videoTrack as any).kind = "video";
    (audioTrack as any).kind = "audio";

    const initStream = new MediaStream([audioTrack, videoTrack]);
    const result = getMediaStreamWithControlledVolume(initStream);

    expect(result.mediaStream.getVideoTracks()).toContain(videoTrack);
    expect(result.mediaStream.getAudioTracks().length).toBe(1);
    expect(result.mediaStream.getAudioTracks()).not.toContain(audioTrack);
  });
});
