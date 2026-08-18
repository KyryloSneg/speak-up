import $api from "@/http";
import { useAuthStore } from "@/stores/auth";
import { useSocketStore } from "@/stores/socket";
import mockSocket from "@/tests/unit/utils/mockSocket";
import { LocalStorageKeys } from "@/types/localStorage";
import connectToSocketAndBindToAllEvents from "@/utils/connectToSocketAndBindToAllEvents";
import handleLogout from "@/utils/handleLogout";
import {
  SocketAuthConnectionErrorCode,
  SocketEvents,
  type UserDto,
} from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("@/utils/connectToSocketAndBindToAllEvents", () => ({
  default: vi.fn(),
}));

vi.mock("@/utils/handleLogout", () => ({ default: vi.fn() }));
vi.mock("vue-sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/http", () => ({
  default: {
    auth: {
      refresh: vi.fn(),
    },
  },
}));

describe("socketStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    mockSocket.resetMock();
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("bindEvents", () => {
    describe("connect_error event", () => {
      describe("auth error", () => {
        it("should properly handle an auth error with a silent refresh of tokens and reconnect", async () => {
          const accessToken = "newAccessToken";
          vi.mocked($api.auth.refresh).mockResolvedValueOnce({
            data: { tokens: { accessToken } },
          } as Awaited<ReturnType<typeof $api.auth.refresh>>);

          const socketStore = useSocketStore();

          socketStore.bindEvents();
          socketStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.CONNECT_ERROR, {
            message: "Authentication Error",
            data: { code: SocketAuthConnectionErrorCode },
          });

          expect(toast.error).not.toHaveBeenCalled();
          expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBe(
            accessToken,
          );

          expect(connectToSocketAndBindToAllEvents).toHaveBeenCalledOnce();
        });

        it("should trigger handleLogout if silent token refresh returns null", async () => {
          vi.mocked($api.auth.refresh).mockResolvedValueOnce({
            data: null,
          } as Awaited<ReturnType<typeof $api.auth.refresh>>);

          const socketStore = useSocketStore();

          socketStore.bindEvents();
          socketStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.CONNECT_ERROR, {
            message: "Authentication Error",
            data: { code: SocketAuthConnectionErrorCode },
          });

          expect(toast.error).not.toHaveBeenCalled();
          expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
          expect(handleLogout).toHaveBeenCalledOnce();
        });
      });

      describe("non-auth error", () => {
        it("should show toast error and not attempt token refresh when no auth error code is provided", async () => {
          const socketStore = useSocketStore();

          socketStore.bindEvents();
          socketStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.CONNECT_ERROR, {
            message: "Unexpected Error",
          });

          expect(toast.error).toHaveBeenCalledExactlyOnceWith(
            "Failed to connect to socket. Some functions might not work correctly.",
          );

          expect($api.auth.refresh).not.toHaveBeenCalled();
        });

        it("should show toast error when error code does not match SocketAuthConnectionErrorCode", async () => {
          const socketStore = useSocketStore();

          socketStore.bindEvents();
          socketStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.CONNECT_ERROR, {
            message: "Unexpected Error",
            data: { code: "OTHER_ERROR_CODE" },
          });

          expect(toast.error).toHaveBeenCalledExactlyOnceWith(
            "Failed to connect to socket. Some functions might not work correctly.",
          );

          expect($api.auth.refresh).not.toHaveBeenCalled();
        });
      });
    });

    describe("disconnect event", () => {
      it("should attempt token refresh and reconnect if user is authenticated", async () => {
        const authStore = useAuthStore();
        authStore.user = { id: "user-1" } as unknown as UserDto;

        const accessToken = "refreshedAccessToken";
        vi.mocked($api.auth.refresh).mockResolvedValueOnce({
          data: { tokens: { accessToken } },
        } as Awaited<ReturnType<typeof $api.auth.refresh>>);

        const socketStore = useSocketStore();

        socketStore.bindEvents();
        socketStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.DISCONNECT, null);

        expect($api.auth.refresh).toHaveBeenCalledOnce();
        expect(localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)).toBe(
          accessToken,
        );

        expect(connectToSocketAndBindToAllEvents).toHaveBeenCalledOnce();
      });

      it("should call handleLogout on disconnect if authenticated but token refresh returns null", async () => {
        const authStore = useAuthStore();
        authStore.user = { id: "user-1" } as unknown as UserDto;

        vi.mocked($api.auth.refresh).mockResolvedValueOnce({
          data: null,
        } as Awaited<ReturnType<typeof $api.auth.refresh>>);

        const socketStore = useSocketStore();

        socketStore.bindEvents();
        socketStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.DISCONNECT, null);

        expect($api.auth.refresh).toHaveBeenCalledOnce();
        expect(handleLogout).toHaveBeenCalledOnce();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
      });

      it("should do nothing on disconnect if user is unauthenticated", async () => {
        const authStore = useAuthStore();
        authStore.user = null;

        const socketStore = useSocketStore();

        socketStore.bindEvents();
        socketStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.DISCONNECT, null);

        expect($api.auth.refresh).not.toHaveBeenCalled();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
        expect(handleLogout).not.toHaveBeenCalled();
      });
    });
  });

  describe("connect", () => {
    describe("when authenticated", () => {
      it("should connect socket if user is authenticated and socket is not connected", () => {
        const authStore = useAuthStore();
        authStore.user = { id: "user-1" } as unknown as UserDto;

        const socketStore = useSocketStore();
        socketStore.connect();

        expect(connectToSocketAndBindToAllEvents).toHaveBeenCalledOnce();
      });

      it("should do nothing if user is authenticated and socket is already connected", () => {
        mockSocket.connected = true;

        const authStore = useAuthStore();
        authStore.user = { id: "user-1" } as unknown as UserDto;

        const socketStore = useSocketStore();
        socketStore.connect();

        expect(mockSocket.disconnect).not.toHaveBeenCalled();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
      });
    });

    describe("when unauthenticated", () => {
      it("should do nothing if user is unauthenticated and socket is not connected", () => {
        const socketStore = useSocketStore();
        socketStore.connect();

        expect(mockSocket.disconnect).not.toHaveBeenCalled();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
      });

      it("should disconnect socket if user is unauthenticated and socket is connected", () => {
        mockSocket.connected = true;

        const socketStore = useSocketStore();
        socketStore.connect();

        expect(mockSocket.disconnect).toHaveBeenCalledOnce();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
      });
    });
  });
});
