import useIsMobile from "@/composables/useIsMobile";
import { useMediaQuery } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockIsMobile = ref(true);

vi.mock("@vueuse/core", () => ({ useMediaQuery: vi.fn(() => mockIsMobile) }));

describe("useIsMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile.value = true;
  });

  it("should properly detect a mobile device", () => {
    const result = useIsMobile();

    expect(useMediaQuery).toHaveBeenCalledExactlyOnceWith("(pointer: coarse)");
    expect(result.value).toBe(mockIsMobile.value);
  });

  it("should properly detect a desktop device", () => {
    mockIsMobile.value = false;
    const result = useIsMobile();

    expect(useMediaQuery).toHaveBeenCalledExactlyOnceWith("(pointer: coarse)");
    expect(result.value).toBe(mockIsMobile.value);
  });
});
