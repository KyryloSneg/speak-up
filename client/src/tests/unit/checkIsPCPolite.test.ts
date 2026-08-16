import { useAuthStore } from "@/stores/auth";
import checkIsPCPolite from "@/utils/checkIsPCPolite";
import type { UserDto } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

describe("checkIsPCPolite", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should return true if user is not authenticated (authStore.user is null)", () => {
    const authStore = useAuthStore();
    authStore.user = null;

    expect(checkIsPCPolite("remote-user-id")).toBe(true);
  });

  it("should return true if user object exists but id is undefined", () => {
    const authStore = useAuthStore();
    authStore.user = {} as unknown as UserDto;

    expect(checkIsPCPolite("remote-user-id")).toBe(true);
  });

  it("should return true if local userId is lexicographically greater than remoteId", () => {
    const authStore = useAuthStore();
    authStore.user = { id: "user-b" } as unknown as UserDto;

    expect(checkIsPCPolite("user-a")).toBe(true);
  });

  it("should return false if local userId is lexicographically smaller than remoteId", () => {
    const authStore = useAuthStore();
    authStore.user = { id: "user-a" } as unknown as UserDto;

    expect(checkIsPCPolite("user-b")).toBe(false);
  });

  it("should return false if local userId is equal to remoteId", () => {
    const authStore = useAuthStore();
    authStore.user = { id: "user-a" } as unknown as UserDto;

    expect(checkIsPCPolite("user-a")).toBe(false);
  });

  it("should correctly handle UUID string comparisons", () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: "b1234567-89ab-cdef-0123-456789abcdef",
    } as unknown as UserDto;

    const smallerRemoteId = "a1234567-89ab-cdef-0123-456789abcdef";
    const largerRemoteId = "c1234567-89ab-cdef-0123-456789abcdef";

    expect(checkIsPCPolite(smallerRemoteId)).toBe(true);
    expect(checkIsPCPolite(largerRemoteId)).toBe(false);
  });
});
