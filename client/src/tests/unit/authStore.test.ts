import $api from "@/http";
import { useAuthStore } from "@/stores/auth";
import { LocalStorageKeys } from "@/types/localStorage";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/http/index", () => ({
  default: {
    auth: {
      refresh: vi.fn(),
    },
  },
}));

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    localStorage.clear();
  });

  it("should properly initialize store", () => {
    const authStore = useAuthStore();

    expect(authStore.user).toBeNull();
    expect(authStore.isAuth).toBe(false);
    expect(authStore.isInitialized).toBe(false);
    expect(authStore.initAuth).toBeTypeOf("function");
  });

  describe("initAuth", () => {
    const successRes = {
      data: {
        user: { id: "id" },
        tokens: { accessToken: "accessToken", refreshToken: "refreshToken" },
      },
      error: null,
    } as const;

    it("should properly initialize authenticated user", async () => {
      const mockRes = successRes;

      vi.mocked($api.auth.refresh).mockImplementationOnce(() => mockRes as any);

      const authStore = useAuthStore();
      await authStore.initAuth();

      expect(authStore.user).toEqual(mockRes.data.user);
      expect(authStore.isAuth).toBe(true);
      expect(authStore.isInitialized).toBe(true);

      expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBe(
        mockRes.data.tokens.accessToken,
      );
    });

    it("should properly initialize unauthenticated user", async () => {
      const mockRes = {
        data: null,
        error: new Error(),
      } as const;

      vi.mocked($api.auth.refresh).mockImplementationOnce(() => mockRes as any);

      const authStore = useAuthStore();
      await authStore.initAuth();

      expect(authStore.user).toBeNull();
      expect(authStore.isAuth).toBe(false);
      expect(authStore.isInitialized).toBe(true);

      expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBeNull();
    });

    it("should call main initAuth logic only once during race condition", async () => {
      const mockRes = successRes;

      vi.mocked($api.auth.refresh).mockImplementation(() => mockRes as any);

      const authStore = useAuthStore();
      await Promise.all([authStore.initAuth(), authStore.initAuth()]);

      expect($api.auth.refresh).toHaveBeenCalledTimes(1);
    });
  });
});
