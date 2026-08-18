import $api from "@/http";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import mockSocket from "@/tests/unit/utils/mockSocket";
import { LocalStorageKeys } from "@/types/localStorage";
import type { Room } from "@/types/room";
import { RoutesWithoutParams } from "@/types/routes";
import handleLogout from "@/utils/handleLogout";
import type { UserDto } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("@/router", () => ({ default: { replace: vi.fn() } }));
vi.mock("@/http", () => ({
  default: {
    auth: {
      logout: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

describe("handleLogout", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    localStorage.clear();
  });

  it("should properly cleanup user data, clear token, and call API logout", async () => {
    const authStore = useAuthStore();
    authStore.user = { id: "id" } as unknown as UserDto;

    localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, "accessToken");
    await handleLogout();

    expect(authStore.user).toBeNull();
    expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBeNull();

    expect($api.auth.logout).toHaveBeenCalledOnce();
    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
  });

  it("should suppress room leave confirmation if an active room exists", async () => {
    const roomStore = useRoomStore();

    roomStore.room = { id: "roomId" } as unknown as Room;
    roomStore.isToSupressLeaveConfirm = false;

    await handleLogout();
    expect(roomStore.isToSupressLeaveConfirm).toBe(true);
  });

  describe("redirect", () => {
    it("should properly redirect user to Sign In page if isRedirect is true (or default)", async () => {
      const result = await handleLogout(true);

      expect(router.replace).toHaveBeenCalledWith(RoutesWithoutParams.SIGN_IN);
      expect(result).toBeUndefined();
    });

    it("should return Sign In page route as the next one if isRedirect is false", async () => {
      const nextRoute = await handleLogout(false);

      expect(nextRoute).toBe(RoutesWithoutParams.SIGN_IN);
      expect(router.replace).not.toHaveBeenCalled();
    });
  });
});
