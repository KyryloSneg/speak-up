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
    describe("connect error event", () => {
      describe("auth error", () => {
        it("should properly handle an auth error with a silent refresh of tokens", async () => {
          const accessToken = "accessToken" as const;
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

          expect(connectToSocketAndBindToAllEvents).toHaveBeenCalled();
        });

        it("should properly handle an auth error with seamless logout", async () => {
          const accessToken = "accessToken" as const;
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

          expect(handleLogout).toHaveBeenCalled();
        });
      });

      describe("arbitrary error", () => {
        it("should properly handle an arbitrary error", async () => {
          const socketStore = useSocketStore();

          socketStore.bindEvents();
          socketStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.CONNECT_ERROR, {
            message: "Unexpected Error",
          });

          expect(toast.error).toHaveBeenCalledOnce();
          expect($api.auth.refresh).not.toHaveBeenCalled();
        });

        it("should properly handle an arbitrary error with non-auth code", async () => {
          const socketStore = useSocketStore();

          socketStore.bindEvents();
          socketStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.CONNECT_ERROR, {
            message: "Unexpected Error",
            data: { code: SocketAuthConnectionErrorCode + "arbitrary" },
          });

          expect(toast.error).toHaveBeenCalledOnce();
          expect($api.auth.refresh).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("connect", () => {
    describe("success", () => {
      it("should properly connect socket if user is authenticated and the connection hasn't started yet", () => {
        const authStore = useAuthStore();
        authStore.user = { id: "id" } as unknown as UserDto;

        const socketStore = useSocketStore();
        socketStore.connect();

        expect(connectToSocketAndBindToAllEvents).toHaveBeenCalledOnce();
      });

      it("should do nothing if user is authenticated and the connection is already established", () => {
        mockSocket.connected = true;

        const authStore = useAuthStore();
        authStore.user = { id: "id" } as unknown as UserDto;

        const socketStore = useSocketStore();
        socketStore.connect();

        expect(mockSocket.disconnect).not.toHaveBeenCalled();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
      });
    });

    describe("failure", () => {
      it("should do nothing if user is unauthenticated and the connection hasn't started yet", () => {
        const socketStore = useSocketStore();
        socketStore.connect();

        expect(mockSocket.disconnect).not.toHaveBeenCalled();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
      });

      it("should properly disconnect socket if user is unauthenticated and the connection is established", () => {
        mockSocket.connected = true;

        const socketStore = useSocketStore();
        socketStore.connect();

        expect(mockSocket.disconnect).toHaveBeenCalledOnce();
        expect(connectToSocketAndBindToAllEvents).not.toHaveBeenCalled();
      });
    });
  });
});
