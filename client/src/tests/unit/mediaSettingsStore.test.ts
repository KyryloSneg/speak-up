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
    it("should initialize default devices correctly when localStorage is empty", () => {
      const mediaSettingsStore = useMediaSettingsStore();

      expect(mediaSettingsStore.defaultMicrophone).toBe("default");
      expect(mediaSettingsStore.defaultCamera).toBe("default");

      expect(localStorage.getItem(LocalStorageKeys.DEFAULT_CAMERA)).toBe(
        "default",
      );
    });

    it("should load default camera from localStorage if present on creation", () => {
      const savedDefaultCamera = "custom-default-cam-id";
      localStorage.setItem(LocalStorageKeys.DEFAULT_CAMERA, savedDefaultCamera);

      const mediaSettingsStore = useMediaSettingsStore();

      expect(mediaSettingsStore.defaultMicrophone).toBe("default");
      expect(mediaSettingsStore.defaultCamera).toBe(savedDefaultCamera);
    });
  });

  describe("selected devices initialization", () => {
    it("should fallback to default devices when localStorage is empty", () => {
      const mediaSettingsStore = useMediaSettingsStore();

      expect(mediaSettingsStore.selectedMicrophone).toBe("default");
      expect(mediaSettingsStore.selectedCamera).toBe("default");
      expect(mediaSettingsStore.microphoneToUse).toBe("default");
      expect(mediaSettingsStore.cameraToUse).toBe("default");

      expect(mediaSettingsStore.selectedDevices).toEqual({
        microphone: "default",
        camera: "default",
      });

      expect(localStorage.getItem(LocalStorageKeys.MICROPHONE)).toBe("default");
      expect(localStorage.getItem(LocalStorageKeys.CAMERA)).toBe("default");
    });

    it("should initialize selected devices from localStorage values", () => {
      const savedMic = "saved-mic-id";
      const savedCam = "saved-cam-id";

      localStorage.setItem(LocalStorageKeys.MICROPHONE, savedMic);
      localStorage.setItem(LocalStorageKeys.CAMERA, savedCam);

      const mediaSettingsStore = useMediaSettingsStore();

      expect(mediaSettingsStore.selectedMicrophone).toBe(savedMic);
      expect(mediaSettingsStore.selectedCamera).toBe(savedCam);
      expect(mediaSettingsStore.microphoneToUse).toBe(savedMic);
      expect(mediaSettingsStore.cameraToUse).toBe(savedCam);

      expect(mediaSettingsStore.selectedDevices).toEqual({
        microphone: savedMic,
        camera: savedCam,
      });
    });
  });

  describe("computed fallback logic & storage reactivity", () => {
    it("should use defaultCamera as cameraToUse when selectedCamera is 'default'", () => {
      const mediaSettingsStore = useMediaSettingsStore();

      mediaSettingsStore.defaultCamera = "hardware-default-cam-123";
      mediaSettingsStore.selectedCamera = "default";

      expect(mediaSettingsStore.cameraToUse).toBe("hardware-default-cam-123");
      expect(mediaSettingsStore.selectedDevices.camera).toBe(
        "hardware-default-cam-123",
      );
    });

    it("should prioritize explicitly selected camera over defaultCamera when not 'default'", () => {
      const mediaSettingsStore = useMediaSettingsStore();

      mediaSettingsStore.defaultCamera = "hardware-default-cam-123";
      mediaSettingsStore.selectedCamera = "explicit-user-cam-456";

      expect(mediaSettingsStore.cameraToUse).toBe("explicit-user-cam-456");
      expect(mediaSettingsStore.selectedDevices.camera).toBe(
        "explicit-user-cam-456",
      );
    });

    it("should reactivity recalculate cameraToUse when defaultCamera changes while selectedCamera is 'default'", () => {
      const mediaSettingsStore = useMediaSettingsStore();

      mediaSettingsStore.selectedCamera = "default";
      mediaSettingsStore.defaultCamera = "initial-cam";

      expect(mediaSettingsStore.cameraToUse).toBe("initial-cam");

      mediaSettingsStore.defaultCamera = "updated-cam";

      expect(mediaSettingsStore.cameraToUse).toBe("updated-cam");
      expect(mediaSettingsStore.selectedDevices.camera).toBe("updated-cam");
    });

    it("should sync changes in selected devices to localStorage", async () => {
      const mediaSettingsStore = useMediaSettingsStore();

      mediaSettingsStore.selectedMicrophone = "new-mic-id";
      mediaSettingsStore.selectedCamera = "new-cam-id";

      expect(mediaSettingsStore.selectedDevices).toEqual({
        microphone: "new-mic-id",
        camera: "new-cam-id",
      });

      await nextTick();
      expect(localStorage.getItem(LocalStorageKeys.MICROPHONE)).toBe(
        "new-mic-id",
      );

      expect(localStorage.getItem(LocalStorageKeys.CAMERA)).toBe("new-cam-id");
    });
  });
});
