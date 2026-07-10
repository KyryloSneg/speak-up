import type { StartUserMediaOnError } from "@/services/MediaDevice";
import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import {
  mockCameras,
  mockDevices,
  mockMicrophones,
} from "@/tests/utils/mediaConsts";
import mockSocket from "@/tests/unit/utils/mockSocket";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import {
  FacingModes,
  type RoomMediaConfig,
  type RoomMediaConfigUserId,
} from "@/types/media";
import { MediaDeviceEvents } from "@/types/mediaDeviceEvents";
import getMediaTrackDeviceId from "@/utils/getMediaTrackDeviceId";
import { mediaDevice } from "@/utils/mediaDevice";
import {
  SocketEvents,
  SocketResponseEvents,
  type SocketMediaConfig,
} from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("vue-sonner", () => ({ toast: { error: vi.fn() } }));

describe("mediaStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();

    mockSocket.resetMock();
    mediaDevice.stop();

    (mediaDevice as any).userMediaStream = null;
    (mediaDevice as any).prevUserMediaStreamId = null;
    (mediaDevice as any).latestMediaStreamId = null;

    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("init", () => {
    it("should initialize roomConfigs as null", () => {
      const mediaStore = useMediaStore();
      expect(mediaStore.roomConfigs).toBeNull();
    });
  });

  describe("bindEvents", () => {
    beforeEach(() => {
      const mediaStore = useMediaStore();

      mediaStore.bindEvents();
      mediaStore.bindEvents();
    });

    describe("send media config event", () => {
      it("should properly handle an error send media config event", () => {
        const error = "Unexpected Error";
        mockSocket.triggerServerEvent(SocketResponseEvents.SEND_MEDIA_CONFIG, {
          error,
        });

        expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
      });
    });

    describe("received media config event", () => {
      it("should properly handle a received media config event", async () => {
        const mediaStore = useMediaStore();
        mediaStore.roomConfigs = new Map();

        const mediaConfig: SocketMediaConfig = {
          audio: true,
          video: false,
        } as const;

        const typedUserId = "userId" as RoomMediaConfigUserId;
        const config: RoomMediaConfig = {
          userId: typedUserId,
          ...mediaConfig,
        } as const;

        await mockSocket.triggerServerEvent(
          SocketEvents.RECEIVED_MEDIA_CONFIG,
          {
            userId: typedUserId,
            config: mediaConfig,
          },
        );

        expect(mediaStore.roomConfigs).toStrictEqual(
          new Map([[typedUserId, config]]),
        );
      });

      it("should ignore a received media config event if user doesn't expect one", async () => {
        const mediaStore = useMediaStore();
        mediaStore.roomConfigs = null;

        const typedUserId = "userId" as RoomMediaConfigUserId;
        const config: RoomMediaConfig = {
          userId: typedUserId,
          audio: true,
          video: false,
        } as const;

        await mockSocket.triggerServerEvent(
          SocketEvents.RECEIVED_MEDIA_CONFIG,
          config,
        );

        expect(mediaStore.roomConfigs).toBeNull();
      });
    });
  });

  describe("sendMediaConfig", () => {
    it("should properly send a media config", () => {
      const mediaStore = useMediaStore();

      const typedUserId = "userId" as RoomMediaConfigUserId;
      const config: RoomMediaConfig = {
        userId: typedUserId,
        audio: true,
        video: true,
      } as const;

      mediaStore.sendMediaConfig(config);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.SEND_MEDIA_CONFIG,
        { config },
      );
    });
  });

  describe("toggleMic and toggleCamera", () => {
    it("should properly toggle media config properties", () => {
      const mediaStore = useMediaStore();
      expect(mediaStore.config).toStrictEqual({ audio: true, video: true });

      mediaStore.toggleMic();
      expect(mediaStore.config).toStrictEqual({ audio: false, video: true });

      mediaStore.toggleCamera();
      expect(mediaStore.config).toStrictEqual({ audio: false, video: false });

      mediaStore.toggleMic();
      expect(mediaStore.config).toStrictEqual({ audio: true, video: false });

      mediaStore.toggleCamera();
      expect(mediaStore.config).toStrictEqual({ audio: true, video: true });
    });

    it("should properly set media config properties", () => {
      const mediaStore = useMediaStore();

      mediaStore.toggleMic(false);
      expect(mediaStore.config).toStrictEqual({ audio: false, video: true });

      mediaStore.toggleCamera(false);
      expect(mediaStore.config).toStrictEqual({ audio: false, video: false });

      mediaStore.toggleMic(true);
      expect(mediaStore.config).toStrictEqual({ audio: true, video: false });

      mediaStore.toggleCamera(false);
      expect(mediaStore.config).toStrictEqual({ audio: true, video: false });

      mediaStore.toggleCamera(true);
      expect(mediaStore.config).toStrictEqual({ audio: true, video: true });

      mediaStore.toggleCamera(true);
      expect(mediaStore.config).toStrictEqual({ audio: true, video: true });
    });
  });

  describe("flipCamera", () => {
    it("should properly toggle flipped camera value", () => {
      const mediaStore = useMediaStore();
      expect(mediaStore.isCameraFlipped).toBe(false);

      mediaStore.flipCamera();
      expect(mediaStore.isCameraFlipped).toBe(true);

      mediaStore.flipCamera();
      expect(mediaStore.isCameraFlipped).toBe(false);
    });

    it("should properly set flipped camera value", () => {
      const mediaStore = useMediaStore();

      mediaStore.flipCamera(true);
      expect(mediaStore.isCameraFlipped).toBe(true);

      mediaStore.flipCamera(true);
      expect(mediaStore.isCameraFlipped).toBe(true);

      mediaStore.flipCamera(false);
      expect(mediaStore.isCameraFlipped).toBe(false);
    });
  });

  describe("updateDevices", () => {
    it("should properly update devices", async () => {
      async function expectDeviceId(
        type: "audio" | "video",
        deviceId?: string | null,
      ): Promise<void> {
        await vi.waitFor(() => {
          const tracks =
            type === "audio"
              ? mediaStore.userMediaStream!.getAudioTracks()
              : mediaStore.userMediaStream!.getVideoTracks();

          const track = tracks[0]!;

          expect(tracks.length).toBe(1);
          expect(getMediaTrackDeviceId(track.getConstraints())).toBe(deviceId);

          if (type === "audio") expect(mediaStore.userAudioTrack).toBe(track);
        });
      }

      async function expectProperDevices(): Promise<void> {
        await Promise.all([
          expectDeviceId(
            "audio",
            mediaSettingsStore.selectedDevices.microphone,
          ),
          expectDeviceId("video", mediaSettingsStore.selectedDevices.camera),
        ]);
      }

      const mediaStore = useMediaStore();
      const mediaSettingsStore = useMediaSettingsStore();

      mediaStore.start();
      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());

      type PrevSelectedDevices = Parameters<typeof mediaStore.updateDevices>[0];

      mediaStore.updateDevices({});
      expect(mediaStore.hasStartedMedia).toBe(true);

      // nothing has changed
      await expectProperDevices();
      const firstPrevSelectedDevices: PrevSelectedDevices = {
        microphone: mediaSettingsStore.selectedDevices.microphone,
        camera: mediaSettingsStore.selectedDevices.camera,
      } as const;

      mediaSettingsStore.selectedMicrophone = "secMicId";
      mediaStore.updateDevices(firstPrevSelectedDevices);

      // mic has changed
      await expectProperDevices();
      const secPrevSelectedDevices: PrevSelectedDevices = {
        microphone: mediaSettingsStore.selectedDevices.microphone,
        camera: mediaSettingsStore.selectedDevices.camera,
      } as const;

      mediaSettingsStore.selectedCamera = "secCameraId";
      mediaStore.updateDevices(secPrevSelectedDevices);

      // camera has changed
      await expectProperDevices();
      mediaSettingsStore.selectedMicrophone = "thirdMicId";

      mediaStore.updateDevices({ microphone: null });
      await expectProperDevices(); // mic has changed

      mediaSettingsStore.selectedCamera = "thirdCameraId";
      mediaStore.updateDevices({ microphone: null, camera: null });

      // camera has changed
      await expectProperDevices();
    });

    it("should start user media stream instead of updating devices if it hasn't been started yet", async () => {
      const mediaStore = useMediaStore();
      mediaStore.updateDevices({ microphone: null, camera: null });

      expect(mediaStore.hasStartedMedia).toBe(true);

      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());
      expect(mediaStore.userAudioTrack).not.toBeNull();
    });

    it("should properly handle an error while updating devices", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const mediaStore = useMediaStore();
      const mediaSettingsStore = useMediaSettingsStore();

      mediaStore.start();
      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());

      Object.defineProperty(global.navigator, "mediaDevices", {
        value: {
          getUserMedia: async () => {
            throw new Error("Unexpected Error");
          },
        },
        writable: true,
        configurable: true,
      });

      mediaSettingsStore.selectedMicrophone = "newMicId";
      mediaSettingsStore.selectedCamera = "newCamId";

      mediaStore.updateDevices({});
      await vi.waitFor(() => expect(toast.error).toHaveBeenCalledOnce());
    });
  });

  describe("start", () => {
    it("should properly start user media stream", async () => {
      const mediaStore = useMediaStore();
      const mediaSettingsStore = useMediaSettingsStore();

      const offSpy = vi.spyOn(mediaDevice, "off");
      const onSpy = vi.spyOn(mediaDevice, "on");

      mediaStore.config = { audio: true, video: true };

      mediaStore.start();
      mediaStore.start(); // ignored, .toHaveBeenCalledOnce will ensure this later

      expect(mediaStore.hasStartedMedia).toBe(true);
      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());

      const audioTracks = mediaStore.userMediaStream!.getAudioTracks();
      const videoTracks = mediaStore.userMediaStream!.getVideoTracks();

      expect(audioTracks.length).toBe(1);
      expect(videoTracks.length).toBe(1);

      const audioTrack = audioTracks[0]!;
      const videoTrack = videoTracks[0]!;

      expect(getMediaTrackDeviceId(audioTrack.getConstraints())).toBe(
        mediaSettingsStore.selectedDevices.microphone,
      );

      expect(getMediaTrackDeviceId(videoTrack.getConstraints())).toBe(
        mediaSettingsStore.selectedDevices.camera,
      );

      expect(videoTrack.getSettings().facingMode).toBe(FacingModes.USER);
      expect(mediaStore.userAudioTrack).toBe(audioTrack);

      expect(
        mediaStore
          .userMediaStream!.getTracks()
          .every(track => track.readyState === "live"),
      ).toBe(true);

      expect(offSpy).toHaveBeenCalledOnce();
      expect(onSpy).toHaveBeenCalledOnce();

      expect(offSpy.mock.lastCall?.[0]).toBe(
        MediaDeviceEvents.USER_MEDIA_STREAM,
      );

      expect(onSpy.mock.lastCall?.[0]).toBe(
        MediaDeviceEvents.USER_MEDIA_STREAM,
      );
    });

    it("should properly start user media stream with a single track", async () => {
      const mediaStore = useMediaStore();
      const mediaSettingsStore = useMediaSettingsStore();

      mediaStore.config = { audio: true, video: false };
      mediaStore.start();

      expect(mediaStore.hasStartedMedia).toBe(true);
      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());

      const audioTracks = mediaStore.userMediaStream!.getAudioTracks();
      const videoTracks = mediaStore.userMediaStream!.getVideoTracks();

      expect(audioTracks.length).toBe(1);
      expect(videoTracks.length).toBe(0);

      const audioTrack = audioTracks[0]!;

      expect(getMediaTrackDeviceId(audioTrack.getConstraints())).toBe(
        mediaSettingsStore.selectedDevices.microphone,
      );

      expect(mediaStore.userAudioTrack).toBe(audioTrack);
      expect(
        mediaStore
          .userMediaStream!.getTracks()
          .every(track => track.readyState === "live"),
      ).toBe(true);
    });

    it("should properly start user media if camera is flipped", async () => {
      const mediaStore = useMediaStore();

      mediaStore.isCameraFlipped = true;
      mediaStore.start();

      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());
      const videoTrack = mediaStore.userMediaStream!.getVideoTracks()[0];

      expect(videoTrack?.getSettings().facingMode).toBe(
        FacingModes.ENVIRONMENT,
      );
    });

    it("should early exit if the media stream is already started", () => {
      const mediaStore = useMediaStore();
      mediaStore.hasStartedMedia = true;

      const offSpy = vi.spyOn(mediaDevice, "off");
      const onSpy = vi.spyOn(mediaDevice, "on");

      const startUserMediaSpy = vi.spyOn(mediaDevice, "startUserMedia");

      mediaStore.start();

      expect(offSpy).not.toHaveBeenCalled();
      expect(onSpy).not.toHaveBeenCalled();
      expect(startUserMediaSpy).not.toHaveBeenCalled();
    });

    it("should properly handle errors of individual tracks", () => {
      const mediaStore = useMediaStore();
      mediaStore.config = { audio: true, video: true };

      const startUserMediaSpy = vi.spyOn(mediaDevice, "startUserMedia");
      mediaStore.start();

      let passedOnError = startUserMediaSpy.mock.calls[0]?.[1]?.onError;
      expect(passedOnError).toBeDefined();

      passedOnError = passedOnError!;

      type StartUserMediaOnErrorArg = Parameters<StartUserMediaOnError>[0];

      const firstError: StartUserMediaOnErrorArg = {
        error: new Error("Unexpected Error"),
        message: "Unexpected Error",
      } as const;

      passedOnError(firstError);

      expect(mediaStore.hasStartedMedia).toBe(true);
      expect(toast.error).toHaveBeenCalledExactlyOnceWith(firstError.message);

      const secError: StartUserMediaOnErrorArg = {
        error: null,
        message: "Something went wrong",
      } as const;

      passedOnError(secError);

      expect(mediaStore.hasStartedMedia).toBe(false);

      expect(toast.error).toHaveBeenLastCalledWith(secError.message);
      expect(toast.error).toHaveBeenCalledTimes(2);
    });

    it("should properly handle error while starting user media", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      Object.defineProperty(global.navigator, "mediaDevices", {
        value: {
          getUserMedia: async () => {
            throw new Error("Unexpected Error");
          },
        },
        writable: true,
        configurable: true,
      });

      const mediaStore = useMediaStore();

      mediaStore.start();
      await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(2));

      expect(mediaStore.userMediaStream).toBeNull();
    });
  });

  describe("stop", () => {
    it("should properly stop current stream", async () => {
      const mediaStore = useMediaStore();

      mediaStore.start();
      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());

      mediaStore.stop();
      expect(
        mediaStore
          .userMediaStream!.getTracks()
          .every(track => track.readyState === "ended"),
      ).toBe(true);
    });
  });

  describe("microphones and cameras", () => {
    beforeEach(() => {
      const mediaStore = useMediaStore();
      mediaStore.devices = mockDevices;
    });

    it("should properly filter microphones", () => {
      const mediaStore = useMediaStore();
      expect(mediaStore.microphones).toStrictEqual(mockMicrophones);
    });

    it("should properly filter cameras", () => {
      const mediaStore = useMediaStore();
      expect(mediaStore.cameras).toStrictEqual(mockCameras);
    });
  });
});
