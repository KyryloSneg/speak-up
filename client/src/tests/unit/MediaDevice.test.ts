import MediaDevice, {
  type StartUserMediaOnError,
} from "@/services/MediaDevice";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { FacingModes, type FacingMode } from "@/types/media";
import { MediaDeviceEvents } from "@/types/mediaDeviceEvents";
import getMediaTrackDeviceId from "@/utils/getMediaTrackDeviceId";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("MediaDevice", () => {
  let mediaDevice: MediaDevice;

  beforeEach(() => {
    setupFakeBrowserMediaEngine();
    vi.restoreAllMocks();

    mediaDevice = new MediaDevice();
  });

  // SUCCESSFULLY start user media stream + check basic expected statements
  async function initializeStream(
    ...args: Parameters<MediaDevice["startUserMedia"]>
  ): Promise<MediaStream> {
    let stream: MediaStream;

    const onError = vi.fn();
    const eventListener = vi.fn(mediaStream => (stream = mediaStream));

    mediaDevice.on(MediaDeviceEvents.USER_MEDIA_STREAM, eventListener);
    const startUserMediaResult = mediaDevice.startUserMedia(args[0], {
      ...args[1],
      onError: (...errorArgs) => {
        onError(...errorArgs);
        args[1]?.onError?.(...errorArgs);
      },
    });

    expect(startUserMediaResult).toBe(mediaDevice);

    await vi.waitFor(() => expect(eventListener).toHaveBeenCalledOnce());
    mediaDevice.off(MediaDeviceEvents.USER_MEDIA_STREAM);

    stream = stream!;

    expect(onError).not.toHaveBeenCalled();
    expect(stream).toBeDefined();

    return stream;
  }

  // the same fn as just above but for the failure cases of .startUserMedia
  async function initializeErrorStream(
    ...args: Parameters<MediaDevice["startUserMedia"]>
  ): Promise<Parameters<StartUserMediaOnError>[0]> {
    let errorInfo: Parameters<StartUserMediaOnError>[0];

    const onError = vi.fn(info => (errorInfo = info));
    const eventListener = vi.fn();

    mediaDevice.on(MediaDeviceEvents.USER_MEDIA_STREAM, eventListener);
    const startUserMediaResult = mediaDevice.startUserMedia(args[0], {
      ...args[1],
      onError: (...errorArgs) => {
        onError(...errorArgs);
        args[1]?.onError?.(...errorArgs);
      },
    });

    expect(startUserMediaResult).toBe(mediaDevice);

    await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce());
    mediaDevice.off(MediaDeviceEvents.USER_MEDIA_STREAM);

    expect(eventListener).not.toHaveBeenCalled();

    errorInfo = errorInfo!;
    expect(errorInfo.error === null || errorInfo.error instanceof Error).toBe(
      true,
    );

    expect(errorInfo.message).toBeTypeOf("string");
    return errorInfo;
  }

  function expectTracksEnabledState(
    stream: MediaStream,
    config: { audio?: boolean; video?: boolean } = {},
  ): void {
    if (typeof config.audio === "boolean") {
      expect(stream.getAudioTracks().every(track => track.enabled)).toBe(
        config.audio,
      );
    }

    if (typeof config.video === "boolean") {
      expect(stream.getVideoTracks().every(track => track.enabled)).toBe(
        config.video,
      );
    }
  }

  describe("startUserMedia", () => {
    describe("success", () => {
      it("should properly emit an event with a media stream with audio and video tracks", async () => {
        const stream = await initializeStream({ audio: true, video: true });

        expect(stream.getAudioTracks().length).toBe(1);
        expect(stream.getVideoTracks().length).toBe(1);
      });

      it("should properly merge old tracks with the new ones and apply correct constraints", async () => {
        const initVideoConstraints: MediaTrackConstraints = {
          facingMode: { exact: FacingModes.USER },
          deviceId: { ideal: "default" },
        } as const;

        const initStream = await initializeStream(
          { audio: true, video: true },
          { videoConstraints: initVideoConstraints },
        );

        const initAudioTrackId = initStream.getAudioTracks()[0]?.id;
        const initVideoTrackId = initStream.getVideoTracks()[0]?.id;

        expect(initStream.getVideoTracks()[0]?.getConstraints()).toStrictEqual(
          expect.objectContaining(initVideoConstraints),
        );

        const videoConstraints: MediaTrackConstraints = {
          facingMode: { exact: FacingModes.ENVIRONMENT },
          deviceId: { exact: "newDeviceId" },
        } as const;

        const stream = await initializeStream(
          { audio: false, video: true },
          { videoConstraints },
        );

        expect(stream.getAudioTracks()[0]?.id).toBe(initAudioTrackId);
        expect(stream.getVideoTracks()[0]?.id).not.toBe(initVideoTrackId);

        expect(stream.getVideoTracks()[0]?.getConstraints()).toStrictEqual(
          expect.objectContaining(videoConstraints),
        );
      });
    });

    describe("failure", () => {
      it("should properly call onError if .mediaDevices API isn't supported", async () => {
        Object.defineProperty(global.navigator, "mediaDevices", {
          value: {
            getUserMedia: undefined,
          },
          writable: true,
          configurable: true,
        });

        const errorInfo = await initializeErrorStream({
          audio: true,
          video: true,
        });

        expect(errorInfo.error).toBeNull();
      });

      it("should properly call onError if getting user media wasn't successful", async () => {
        // temporarily silence console.error log for this test specifically
        const consoleErrorSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const error = new Error("NotAllowedError");

        Object.defineProperty(global.navigator, "mediaDevices", {
          value: {
            getUserMedia: async () => {
              throw error;
            },
          },
          writable: true,
          configurable: true,
        });

        const errorInfo = await initializeErrorStream({
          audio: true,
          video: false,
        });

        expect(errorInfo.error).toBeInstanceOf(Error);
        expect(errorInfo.error).toBe(error);

        expect(consoleErrorSpy).toHaveBeenCalledOnce();
      });
    });
  });

  describe("toggleUserMedia", () => {
    it("should properly toggle tracks", async () => {
      const stream = await initializeStream({ audio: true, video: true });
      expectTracksEnabledState(stream, { audio: true, video: true });

      mediaDevice.toggleUserMedia("audio");
      expectTracksEnabledState(stream, { audio: false, video: true });

      mediaDevice.toggleUserMedia("video");
      expectTracksEnabledState(stream, { audio: false, video: false });

      mediaDevice.toggleUserMedia("audio");
      expectTracksEnabledState(stream, { audio: true, video: false });

      mediaDevice.toggleUserMedia("video");
      expectTracksEnabledState(stream, { audio: true, video: true });
    });

    it("should properly set tracks enabled state", async () => {
      const stream = await initializeStream({ audio: true, video: true });

      mediaDevice.toggleUserMedia("audio", false);
      expectTracksEnabledState(stream, { audio: false, video: true });

      mediaDevice.toggleUserMedia("video", false);
      expectTracksEnabledState(stream, { audio: false, video: false });

      mediaDevice.toggleUserMedia("audio", true);
      expectTracksEnabledState(stream, { audio: true, video: false });

      mediaDevice.toggleUserMedia("video", false);
      expectTracksEnabledState(stream, { audio: true, video: false });

      mediaDevice.toggleUserMedia("video", true);
      expectTracksEnabledState(stream, { audio: true, video: true });

      mediaDevice.toggleUserMedia("video", true);
      expectTracksEnabledState(stream, { audio: true, video: true });
    });
  });

  describe("toggleIsCameraFlipped", () => {
    function expectFacingMode(
      stream: MediaStream,
      facingMode: FacingMode,
    ): void {
      type ObjectFacingMode = { exact?: string } & { ideal?: string };
      const constraints: MediaTrackConstraints | undefined = stream
        .getVideoTracks()[0]
        ?.getConstraints();

      const retrievedFacingMode =
        typeof constraints?.facingMode === "string"
          ? constraints.facingMode
          : (constraints?.facingMode as unknown as ObjectFacingMode)?.exact ||
            (constraints?.facingMode as unknown as ObjectFacingMode)?.ideal;

      expect(retrievedFacingMode).toBe(facingMode);
    }

    function expectFacingModeNotSet(
      stream: MediaStream,
      facingMode: FacingMode,
    ): void {
      const constraints = stream.getVideoTracks()[0]?.getConstraints();
      expect(constraints).not.toStrictEqual(
        expect.objectContaining({ facingMode: facingMode }),
      );

      expect(constraints).not.toStrictEqual(
        expect.objectContaining({
          facingMode: { ideal: facingMode },
        }),
      );

      expect(constraints).not.toStrictEqual(
        expect.objectContaining({
          facingMode: { exact: facingMode },
        }),
      );
    }

    it("should properly toggle facingMode value", async () => {
      const stream = await initializeStream({ audio: true, video: true });
      expectFacingModeNotSet(stream, FacingModes.ENVIRONMENT);

      mediaDevice.toggleIsCameraFlipped();
      expectFacingMode(stream, FacingModes.ENVIRONMENT);

      mediaDevice.toggleIsCameraFlipped();
      expectFacingMode(stream, FacingModes.USER);
    });

    it("should properly set facingMode value", async () => {
      const stream = await initializeStream({ audio: false, video: true });

      mediaDevice.toggleIsCameraFlipped(FacingModes.ENVIRONMENT);
      expectFacingMode(stream, FacingModes.ENVIRONMENT);

      mediaDevice.toggleIsCameraFlipped(FacingModes.USER);
      expectFacingMode(stream, FacingModes.USER);
    });
  });

  describe("changeDeviceId", () => {
    function getDeviceId(stream: MediaStream, type: "audio" | "video"): string {
      const tracks =
        type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      return getMediaTrackDeviceId(tracks[0]?.getConstraints());
    }

    it("should successfully change mic and camera", async () => {
      const stream = await initializeStream({ audio: true, video: true });
      const initCamId = getDeviceId(stream, "video");

      const newMicId = "newMicId";
      const newCamId = "newCamId";

      mediaDevice.changeDeviceId({ audio: newMicId });
      await vi.waitFor(() =>
        expect(getDeviceId(stream, "audio")).toBe(newMicId),
      );

      expect(getDeviceId(stream, "video")).toBe(initCamId);

      mediaDevice.changeDeviceId({ video: newCamId });
      await vi.waitFor(() =>
        expect(getDeviceId(stream, "video")).toBe(newCamId),
      );

      expect(getDeviceId(stream, "audio")).toBe(newMicId);
    });

    it("should successfully change mic if current tracks are stopped", async () => {
      const stream = await initializeStream({ audio: true, video: false });
      stream.getTracks().forEach(track => track.stop());

      const newMicId = "newMicId";
      const newCamId = "newCamId";

      mediaDevice.changeDeviceId({ audio: newMicId, video: newCamId });
      await Promise.all([
        vi.waitFor(() => expect(getDeviceId(stream, "audio")).toBe(newMicId)),
        // the camera is retrieved too
        vi.waitFor(() => expect(getDeviceId(stream, "video")).toBe(newCamId)),
      ]);

      expect(stream.getAudioTracks().length).toBe(1);
      expect(stream.getVideoTracks().length).toBe(1);

      expect(
        stream.getTracks().every(track => track.readyState === "live"),
      ).toBe(true);
    });

    it("should successfully change a device if the related tracks failed to start previously", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const initMicId = "initMicId";
      const initCamId = "initCamId";

      const stream = await initializeStream(
        { audio: true, video: true },
        {
          audioConstraints: { deviceId: { exact: initMicId } },
          videoConstraints: { deviceId: { exact: initCamId } },
        },
      );

      await Promise.all([
        vi.waitFor(() => expect(getDeviceId(stream, "audio")).toBe(initMicId)),
        vi.waitFor(() => expect(getDeviceId(stream, "video")).toBe(initCamId)),
      ]);

      const initAudioTrack = stream.getAudioTracks()[0]!;
      const initVideoTrack = stream.getVideoTracks()[0]!;

      const error = new Error("NotReadableError");
      const originalMediaDevices = navigator.mediaDevices;

      Object.defineProperty(global.navigator, "mediaDevices", {
        value: {
          ...originalMediaDevices,
          getUserMedia: async () => {
            throw error;
          },
        },
        writable: true,
        configurable: true,
      });

      const newCamId = "newCamId";

      let errorInfo: Parameters<StartUserMediaOnError>[0];
      const onError = vi.fn(info => (errorInfo = info));

      mediaDevice.changeDeviceId({ video: newCamId }, onError);
      await vi.waitFor(() => expect(onError).toHaveBeenCalled());

      errorInfo = errorInfo!;
      expect(errorInfo.error === null || errorInfo.error instanceof Error).toBe(
        true,
      );

      expect(errorInfo.message).toBeTypeOf("string");

      expect(onError).toHaveBeenCalledOnce();
      expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error);

      expect(stream.getAudioTracks().length).toBe(1);
      expect(stream.getVideoTracks().length).toBe(0);

      const audioTrack = stream.getAudioTracks()[0]!;
      const videoTrack = stream.getVideoTracks()[0];

      expect(audioTrack).toBe(initAudioTrack);
      expect(videoTrack).not.toBeDefined();

      expect(audioTrack.readyState).toBe("live");

      Object.defineProperty(navigator, "mediaDevices", {
        value: originalMediaDevices,
        writable: true,
        configurable: true,
      });

      mediaDevice.changeDeviceId({ video: newCamId }, onError);
      await vi.waitFor(() =>
        expect(getDeviceId(stream, "video")).toBe(newCamId),
      );

      const finalAudioTrack = stream.getAudioTracks()[0]!;
      const finalVideoTrack = stream.getVideoTracks()[0]!;

      expect(finalAudioTrack).toBe(initAudioTrack);

      expect(finalVideoTrack).toBeDefined();
      expect(finalVideoTrack).not.toBe(initVideoTrack);

      expect(
        stream.getTracks().every(track => track.readyState === "live"),
      ).toBe(true);

      // shouldn't be triggered after the error case
      expect(onError).toHaveBeenCalledOnce();
      expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error);
    });
  });

  describe("stop", () => {
    it("should properly stop current stream", async () => {
      const stream = await initializeStream({ audio: true, video: true });
      mediaDevice.stop();

      expect(mediaDevice.events).toStrictEqual({});
      expect(
        stream.getTracks().every(track => track.readyState === "ended"),
      ).toBe(true);
    });
  });
});
