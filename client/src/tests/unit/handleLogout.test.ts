import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import mockSocket from "@/tests/unit/utils/mockSocket";
import { LocalStorageKeys } from "@/types/localStorage";
import { RoutesWithoutParams } from "@/types/routes";
import handleLogout from "@/utils/handleLogout";
import type { UserDto } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("@/router", () => ({ default: { replace: vi.fn() } }));

describe("handleLogout", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    localStorage.clear();
  });

  it("should properly cleanup user data", () => {
    const authStore = useAuthStore();
    authStore.user = { id: "id" } as unknown as UserDto;

    localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, "accessToken");
    handleLogout();

    expect(authStore.user).toBeNull();
    expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBeNull();
    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
  });

  describe("redirect", () => {
    it("should properly redirect user to Sign In page if isRedirect is true", () => {
      const result = handleLogout(true);

      expect(router.replace).toHaveBeenCalledWith(RoutesWithoutParams.SIGN_IN);
      expect(result).toBeUndefined();
    });

    it("should return Sign In page route as the next one if isRedirect is false", () => {
      const nextRoute = handleLogout(false);
      expect(nextRoute).toBe(RoutesWithoutParams.SIGN_IN);
    });
  });
});
