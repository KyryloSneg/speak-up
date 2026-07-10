import useGettingMediaPermissions from "@/composables/useGettingMediaPermissions";
import { usePermissionsStore } from "@/stores/permissions";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue"; // 1. Import effectScope

const mockMicPermission = ref<PermissionState>("prompt");
const mockCamPermission = ref<PermissionState>("prompt");

vi.mock("@vueuse/core", () => ({
  usePermission: vi.fn((permissionName: "microphone" | "camera") =>
    permissionName === "microphone" ? mockMicPermission : mockCamPermission,
  ),
}));

describe("useGettingMediaPermissions", () => {
  let scope: EffectScope;

  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();

    vi.clearAllMocks();

    mockMicPermission.value = "prompt";
    mockCamPermission.value = "prompt";

    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
  });

  describe("store synchronization", () => {
    it("should initialize store permissions with usePermission values", () => {
      mockMicPermission.value = "granted";
      mockCamPermission.value = "denied";

      const permissionsStore = usePermissionsStore();

      scope.run(() => {
        useGettingMediaPermissions();
      });

      expect(permissionsStore.microphone).toBe("granted");
      expect(permissionsStore.camera).toBe("denied");
    });

    it("should update the store dynamically when permission values change", async () => {
      const permissionsStore = usePermissionsStore();

      scope.run(() => {
        useGettingMediaPermissions();
      });

      mockMicPermission.value = "denied";
      mockCamPermission.value = "granted";
      await nextTick();

      expect(permissionsStore.microphone).toBe("denied");
      expect(permissionsStore.camera).toBe("granted");
    });
  });

  describe("prompting logic", () => {
    it("should request both audio and video streams if both permissions are prompted", async () => {
      mockMicPermission.value = "prompt";
      mockCamPermission.value = "prompt";

      scope.run(() => {
        useGettingMediaPermissions();
      });

      await nextTick();
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
        video: true,
      });

      await vi.waitFor(async () => {
        const stream = await (
          navigator.mediaDevices.getUserMedia as unknown as {
            mock: { results: { value: Promise<MediaStream> }[] };
          }
        ).mock.results[0]?.value;

        expect(stream).toBeDefined();
        const tracks = stream!.getTracks();

        expect(tracks).toHaveLength(2);
        expect(tracks.every(track => track.readyState === "ended")).toBe(true);
      });
    });

    it("should only request video if only the camera gets prompted", async () => {
      mockMicPermission.value = "granted";
      mockCamPermission.value = "prompt";

      scope.run(() => {
        useGettingMediaPermissions();
      });

      await nextTick();
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: false,
        video: true,
      });
    });

    it("should only request audio if only the microphone gets prompted", async () => {
      mockMicPermission.value = "prompt";
      mockCamPermission.value = "denied";

      scope.run(() => {
        useGettingMediaPermissions();
      });

      await nextTick();
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
        video: false,
      });
    });

    it("shouldn't trigger getUserMedia if no permissions are in 'prompt' status", async () => {
      mockMicPermission.value = "granted";
      mockCamPermission.value = "denied";

      scope.run(() => {
        useGettingMediaPermissions();
      });

      await nextTick();
      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    });

    it("shouldn't prompt permissions redundantly", async () => {
      scope.run(() => {
        useGettingMediaPermissions();
      });

      await nextTick();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledOnce();

      mockMicPermission.value = "prompt";
      await nextTick();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledOnce();
    });
  });
});
