import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { LocalStorageKeys } from "@/types/localStorage";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

describe("mediaSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe("default devices", () => {
    it("should use proper default devices if localStorage is empty", () => {
      const mediaSettingsStore = useMediaSettingsStore();

      expect(mediaSettingsStore.defaultMicrophone).toBe("default");
      expect(mediaSettingsStore.defaultCamera).toBe("default");

      expect(localStorage.getItem(LocalStorageKeys.DEFAULT_CAMERA)).toBe(
        mediaSettingsStore.defaultCamera,
      );
    });

    it("should use proper default devices if localStorage is set", () => {
      const localStorageDefaultCamera = "deviceId" as const;
      localStorage.setItem(
        LocalStorageKeys.DEFAULT_CAMERA,
        localStorageDefaultCamera,
      );

      const mediaSettingsStore = useMediaSettingsStore();

      expect(mediaSettingsStore.defaultMicrophone).toBe("default");
      expect(mediaSettingsStore.defaultCamera).toBe(localStorageDefaultCamera);
    });
  });

  describe("selected devices", () => {
    describe("initialization", () => {
      it("should use proper selected devices by default if localStorage is empty", () => {
        const mediaSettingsStore = useMediaSettingsStore();
        expect(mediaSettingsStore.selectedMicrophone).toBe(
          mediaSettingsStore.defaultMicrophone,
        );

        expect(mediaSettingsStore.selectedCamera).toBe(
          mediaSettingsStore.defaultCamera,
        );

        expect(mediaSettingsStore.cameraToUse).toBe(
          mediaSettingsStore.defaultCamera,
        );

        expect(mediaSettingsStore.selectedDevices).toStrictEqual({
          microphone: mediaSettingsStore.selectedMicrophone,
          camera: mediaSettingsStore.cameraToUse,
        });

        expect(localStorage.getItem(LocalStorageKeys.MICROPHONE)).toBe(
          mediaSettingsStore.selectedMicrophone,
        );

        expect(localStorage.getItem(LocalStorageKeys.CAMERA)).toBe(
          mediaSettingsStore.selectedCamera,
        );
      });

      it("should use proper selected devices by default if localStorage is set", () => {
        const localStorageSelectedMic = "microphoneId" as const;
        const localStorageSelectedCamera = "cameraId" as const;

        localStorage.setItem(
          LocalStorageKeys.MICROPHONE,
          localStorageSelectedMic,
        );

        localStorage.setItem(
          LocalStorageKeys.CAMERA,
          localStorageSelectedCamera,
        );

        const mediaSettingsStore = useMediaSettingsStore();
        expect(mediaSettingsStore.selectedMicrophone).toBe(
          localStorageSelectedMic,
        );

        expect(mediaSettingsStore.selectedCamera).toBe(
          localStorageSelectedCamera,
        );

        expect(mediaSettingsStore.cameraToUse).toBe(localStorageSelectedCamera);
        expect(mediaSettingsStore.selectedDevices).toStrictEqual({
          microphone: localStorageSelectedMic,
          camera: localStorageSelectedCamera,
        });
      });
    });

    describe("select devices sync", () => {
      it("should properly sync .selectedMicrophone and .selectedCamera with .selectedDevices and localStorage", async () => {
        const mediaSettingsStore = useMediaSettingsStore();

        mediaSettingsStore.selectedMicrophone = "microphoneId";
        mediaSettingsStore.selectedCamera = "cameraId";

        expect(mediaSettingsStore.selectedDevices).toStrictEqual({
          microphone: mediaSettingsStore.selectedMicrophone,
          camera: mediaSettingsStore.selectedCamera,
        });

        await nextTick();
        expect(localStorage.getItem(LocalStorageKeys.MICROPHONE)).toBe(
          mediaSettingsStore.selectedMicrophone,
        );

        expect(localStorage.getItem(LocalStorageKeys.CAMERA)).toBe(
          mediaSettingsStore.selectedCamera,
        );
      });

      it("should fall back to default camera if currently selected one is 'default'", () => {
        const mediaSettingsStore = useMediaSettingsStore();

        mediaSettingsStore.defaultCamera = "cameraId";
        mediaSettingsStore.selectedCamera = "default";

        expect(mediaSettingsStore.cameraToUse).toBe(
          mediaSettingsStore.defaultCamera,
        );

        expect(mediaSettingsStore.selectedDevices.camera).toBe(
          mediaSettingsStore.defaultCamera,
        );
      });

      it("should update selected devices if default camera changes when selected one is 'default'", () => {
        const mediaSettingsStore = useMediaSettingsStore();

        mediaSettingsStore.selectedCamera = "default";
        mediaSettingsStore.defaultCamera = "cameraId";

        expect(mediaSettingsStore.selectedDevices.camera).toBe(
          mediaSettingsStore.defaultCamera,
        );

        mediaSettingsStore.defaultCamera = "anotherCameraId";
        expect(mediaSettingsStore.selectedDevices.camera).toBe(
          mediaSettingsStore.defaultCamera,
        );
      });
    });
  });
});
