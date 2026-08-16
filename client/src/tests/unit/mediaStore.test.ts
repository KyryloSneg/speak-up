import type { StartUserMediaOnError } from "@/services/MediaDevice";
import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { useWebRTCStore } from "@/stores/webrtc";
import mockSocket from "@/tests/unit/utils/mockSocket";
import {
  mockCameras,
  mockDevices,
  mockMicrophones,
} from "@/tests/utils/mediaConsts";
import setupFakeBrowserAudioContext from "@/tests/utils/setupFakeBrowserAudioContext";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import setupFakeWebRTCEngine from "@/tests/utils/setupFakeBrowserWebRTCEngine";
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
    setupFakeBrowserAudioContext();
    setupFakeWebRTCEngine();

    mockSocket.resetMock();
    mediaDevice.stop();

    (mediaDevice as any).userMediaStream = null;
    (mediaDevice as any).prevUserMediaStreamId = null;
    (mediaDevice as any).latestMediaStreamId = null;

    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("init", () => {
    it("should initialize roomConfigs, rawUserMediaStream, and screenSharingStream as null", () => {
      const mediaStore = useMediaStore();
      expect(mediaStore.roomConfigs).toBeNull();
      expect(mediaStore.rawUserMediaStream).toBeNull();
      expect(mediaStore.screenSharingStream).toBeNull();
      expect(mediaStore.hasStartedMedia).toBe(false);
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
          const processedTracks =
            type === "audio"
              ? mediaStore.userMediaStream!.getAudioTracks()
              : mediaStore.userMediaStream!.getVideoTracks();

          expect(processedTracks.length).toBe(1);

          const targetTrack =
            type === "audio"
              ? mediaStore.rawUserMediaStream!.getAudioTracks()[0]!
              : processedTracks[0]!;

          expect(getMediaTrackDeviceId(targetTrack.getConstraints())).toBe(
            deviceId,
          );
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
      expect(
        mediaStore.userMediaStream?.getAudioTracks().length,
      ).toBeGreaterThan(0);
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
      mediaStore.start(); // ignored

      expect(mediaStore.hasStartedMedia).toBe(true);
      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());

      const audioTracks = mediaStore.userMediaStream!.getAudioTracks();
      const videoTracks = mediaStore.userMediaStream!.getVideoTracks();

      expect(audioTracks.length).toBe(1);
      expect(videoTracks.length).toBe(1);

      const rawAudioTrack = mediaStore.rawUserMediaStream!.getAudioTracks()[0]!;
      const videoTrack = videoTracks[0]!;

      expect(getMediaTrackDeviceId(rawAudioTrack.getConstraints())).toBe(
        mediaSettingsStore.selectedDevices.microphone,
      );

      expect(getMediaTrackDeviceId(videoTrack.getConstraints())).toBe(
        mediaSettingsStore.selectedDevices.camera,
      );

      expect(videoTrack.getSettings().facingMode).toBe(FacingModes.USER);

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

      const rawAudioTrack = mediaStore.rawUserMediaStream!.getAudioTracks()[0]!;

      expect(getMediaTrackDeviceId(rawAudioTrack.getConstraints())).toBe(
        mediaSettingsStore.selectedDevices.microphone,
      );

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

      expect(mediaStore.rawUserMediaStream).toBeNull();
    });
  });

  describe("startScreenSharing and stopScreenSharing", () => {
    it("should properly start screen sharing and dispatch stream to webRTCStore", () => {
      const mediaStore = useMediaStore();
      const webRTCStore = useWebRTCStore();

      const sendScreenSharingSpy = vi
        .spyOn(webRTCStore, "sendScreenSharing")
        .mockImplementation(() => {});

      const startScreenSharingSpy = vi.spyOn(mediaDevice, "startScreenSharing");

      const offSpy = vi.spyOn(mediaDevice, "off");
      const onSpy = vi.spyOn(mediaDevice, "on");

      mediaStore.startScreenSharing();

      expect(startScreenSharingSpy).toHaveBeenCalledOnce();

      expect(offSpy).toHaveBeenCalledWith(
        MediaDeviceEvents.SCREEN_SHARING_STREAM,
      );
      expect(onSpy).toHaveBeenCalledWith(
        MediaDeviceEvents.SCREEN_SHARING_STREAM,
        expect.any(Function),
      );

      const mockScreenStream = new MediaStream() as any;
      const fakeVideoTrack = new MediaStreamTrack();
      Object.defineProperty(fakeVideoTrack, "kind", { value: "video" });
      mockScreenStream.addTrack(fakeVideoTrack);

      mediaDevice.emit(
        MediaDeviceEvents.SCREEN_SHARING_STREAM,
        mockScreenStream,
      );

      expect(mediaStore.screenSharingStream).toBe(mockScreenStream);
      expect(sendScreenSharingSpy).toHaveBeenCalledExactlyOnceWith(
        mockScreenStream,
      );
    });

    it("should properly handle error when screen sharing fails to start", () => {
      const mediaStore = useMediaStore();
      const errorMessage = "Screen sharing permission denied";

      vi.spyOn(mediaDevice, "startScreenSharing").mockImplementation(
        onError => {
          onError?.({
            message: errorMessage,
            error: new Error(errorMessage),
          });
        },
      );

      mediaStore.startScreenSharing();
      expect(toast.error).toHaveBeenCalledExactlyOnceWith(errorMessage);
    });

    it("should properly trigger stop screen sharing on mediaDevice", () => {
      const mediaStore = useMediaStore();
      const stopScreenSharingSpy = vi.spyOn(mediaDevice, "stopScreenSharing");

      mediaStore.stopScreenSharing();
      expect(stopScreenSharingSpy).toHaveBeenCalledOnce();
    });
  });

  describe("stop", () => {
    it("should properly stop current stream and screen sharing", async () => {
      const mediaStore = useMediaStore();
      const stopScreenSharingSpy = vi.spyOn(mediaDevice, "stopScreenSharing");

      mediaStore.start();
      await vi.waitFor(() => expect(mediaStore.userMediaStream).not.toBeNull());

      mediaStore.stop();

      expect(stopScreenSharingSpy).toHaveBeenCalledTimes(2);
      expect(mediaStore.hasStartedMedia).toBe(false);

      if (mediaStore.userMediaStream) {
        expect(
          mediaStore.userMediaStream
            .getTracks()
            .every(track => track.readyState === "ended"),
        ).toBe(true);
      } else {
        expect(mediaStore.userMediaStream).toBeNull();
      }
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
