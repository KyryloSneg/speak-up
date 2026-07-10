import postAuthCb from "@/utils/postAuthCb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConnect = vi.fn();

vi.mock("@/stores/socket", () => ({
  useSocketStore: () => ({
    connect: mockConnect,
  }),
}));

describe("postAuthCb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should properly connect to socket", () => {
    postAuthCb();
    expect(mockConnect).toHaveBeenCalledOnce();
  });
});
