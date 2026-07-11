import useAppInitialization from "@/composables/useAppInitialization";
import useAuthMediaDevicesInitialization from "@/composables/useAuthMediaDevicesInitialization";
import useUserSynchronization from "@/composables/useUserSynchronization";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/composables/useUserSynchronization", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useAuthMediaDevicesInitialization", () => ({
  default: vi.fn(),
}));

describe("useAppInitialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should properly initialize the app", () => {
    useAppInitialization();

    expect(useUserSynchronization).toHaveBeenCalledOnce();
    expect(useAuthMediaDevicesInitialization).toHaveBeenCalledOnce();
  });
});
