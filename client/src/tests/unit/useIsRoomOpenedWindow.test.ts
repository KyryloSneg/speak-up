import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import { roomOpenedWindowBreakpoint } from "@/utils/breakpointConsts";
import { useMediaQuery } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockIsRoomOpenedWindow = ref(false);

vi.mock("@vueuse/core", () => ({
  useMediaQuery: vi.fn(() => mockIsRoomOpenedWindow),
}));

describe("useIsRoomOpenedWindow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsRoomOpenedWindow.value = false;
  });

  it("should properly detect viewport that CAN'T show room opened window as an aside", () => {
    const result = useIsRoomOpenedWindow();
    expect(useMediaQuery).toHaveBeenCalledExactlyOnceWith(
      `(min-width: ${roomOpenedWindowBreakpoint})`,
    );

    expect(result.value).toBe(mockIsRoomOpenedWindow.value);
  });

  it("should properly detect viewport that CAN show room opened window as an aside", () => {
    mockIsRoomOpenedWindow.value = true;
    const result = useIsRoomOpenedWindow();

    expect(useMediaQuery).toHaveBeenCalledExactlyOnceWith(
      `(min-width: ${roomOpenedWindowBreakpoint})`,
    );

    expect(result.value).toBe(mockIsRoomOpenedWindow.value);
  });
});
