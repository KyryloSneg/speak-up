import useGettingAllMediaDevices from "@/composables/useGettingAllMediaDevices";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import {
  mockAudioOutputs,
  mockCameras,
  mockMicrophones,
  mockUserMediaDevices,
} from "@/tests/utils/mediaConsts";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useGettingAllMediaDevices", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();
  });

  describe("permissions are not granted", () => {
    it("shouldn't retrieve devices if all permissions are denied", async () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      permissionsStore.microphone = "denied";
      permissionsStore.camera = "denied";

      useGettingAllMediaDevices();
      await nextTick();

      expect(mediaStore.devices.length).toBe(0);
      expect(navigator.mediaDevices.enumerateDevices).not.toHaveBeenCalled();
    });

    it("should enumerate devices but yield empty array if permissions are prompted", async () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      permissionsStore.microphone = "prompt";
      permissionsStore.camera = "prompt";

      useGettingAllMediaDevices();
      await nextTick();

      expect(mediaStore.devices.length).toBe(0);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledOnce();
    });
  });

  describe("permissions granted", () => {
    it("should properly retrieve devices if all permissions are granted", async () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      permissionsStore.microphone = "granted";
      permissionsStore.camera = "granted";

      useGettingAllMediaDevices();
      await nextTick();

      expect(mediaStore.devices).toStrictEqual(mockUserMediaDevices);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledOnce();
    });

    it("should properly retrieve microphones if only the corresponding permission is granted", async () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      permissionsStore.microphone = "granted";

      useGettingAllMediaDevices();
      await nextTick();

      expect(mediaStore.devices).toStrictEqual(mockMicrophones);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledOnce();
    });

    it("should properly retrieve cameras if only the corresponding permission is granted", async () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      permissionsStore.camera = "granted";

      useGettingAllMediaDevices();
      await nextTick();

      expect(mediaStore.devices).toStrictEqual(mockCameras);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledOnce();
    });
  });

  describe("reactivity", () => {
    it("should properly react to permission updates", async () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      permissionsStore.microphone = "prompt";
      permissionsStore.camera = "prompt";

      useGettingAllMediaDevices();
      await nextTick();

      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1);

      permissionsStore.microphone = "granted";
      await nextTick();

      expect(mediaStore.devices).toStrictEqual(mockMicrophones);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(2);

      permissionsStore.camera = "granted";
      await nextTick();

      expect(mediaStore.devices).toStrictEqual(mockUserMediaDevices);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(3);

      permissionsStore.microphone = "denied";
      await nextTick();

      expect(mediaStore.devices).toStrictEqual(mockCameras);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(4);

      permissionsStore.camera = "denied";
      await nextTick();

      expect(mediaStore.devices.length).toBe(0);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(4);
    });

    it("should properly react to 'devicechange' event", async () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      permissionsStore.microphone = "granted";
      permissionsStore.camera = "granted";

      useGettingAllMediaDevices();
      await nextTick();

      const newCamera: MediaDeviceInfo = {
        deviceId: "newDeviceId",
        groupId: "newGroupId",
        kind: "videoinput",
        label: "newLabel",
        toJSON: () => {},
      } as const;

      const expectedDevices = [...mockMicrophones, mockCameras[0]!, newCamera];
      const changedDevices: MediaDeviceInfo[] = [
        ...expectedDevices,
        ...mockAudioOutputs,
      ] as const;

      vi.spyOn(navigator.mediaDevices, "enumerateDevices").mockResolvedValue(
        changedDevices,
      );

      navigator.mediaDevices.dispatchEvent(new Event("devicechange"));

      await vi.waitFor(() =>
        expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(
          2,
        ),
      );

      expect(mediaStore.devices).toStrictEqual(expectedDevices);
    });
  });
});
