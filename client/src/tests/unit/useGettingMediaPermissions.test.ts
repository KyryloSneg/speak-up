import useGettingMediaPermissions from "@/composables/useGettingMediaPermissions";
import { usePermissionsStore } from "@/stores/permissions";
import { useUserMedia } from "@vueuse/core";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";

const mockMicPermission = ref<PermissionState | undefined>("prompt");
const mockCamPermission = ref<PermissionState | undefined>("prompt");

const mockStart = vi.fn().mockResolvedValue(undefined);
const mockStop = vi.fn();

vi.mock("@vueuse/core", () => ({
  usePermission: vi.fn((permissionName: "microphone" | "camera") =>
    permissionName === "microphone" ? mockMicPermission : mockCamPermission,
  ),
  useUserMedia: vi.fn(() => ({
    start: mockStart,
    stop: mockStop,
  })),
}));

describe("useGettingMediaPermissions", () => {
  let scope: EffectScope;

  beforeEach(() => {
    setActivePinia(createPinia());
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

  describe("media permissions requesting", () => {
    it("should initialize useUserMedia with correct constraints and attempt to start/stop stream", async () => {
      scope.run(() => {
        useGettingMediaPermissions();
      });

      expect(useUserMedia).toHaveBeenCalledWith({
        constraints: { video: true, audio: true },
      });

      expect(mockStart).toHaveBeenCalledOnce();

      await Promise.resolve();
      expect(mockStop).toHaveBeenCalledOnce();
    });

    it("should ensure stop is called even if start fails (e.g., user denies prompt)", async () => {
      mockStart.mockRejectedValueOnce(new Error("Permission denied"));

      scope.run(() => {
        useGettingMediaPermissions();
      });

      expect(mockStart).toHaveBeenCalledOnce();

      await Promise.resolve();
      expect(mockStop).toHaveBeenCalledOnce();
    });
  });
});
