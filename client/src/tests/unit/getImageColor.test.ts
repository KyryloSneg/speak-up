import getImageColor from "@/utils/getImageColor";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getImageColor", () => {
  let originalImage: typeof Image;
  let mockImageInstance: {
    src: string;
    onload: (() => void) | null;
    onerror: ((e: unknown) => void) | null;
  };

  beforeEach(() => {
    originalImage = globalThis.Image;

    globalThis.Image = class {
      public src = "";
      public onload: (() => void) | null = null;
      public onerror: ((e: unknown) => void) | null = null;

      constructor() {
        mockImageInstance = this;
      }
    } as unknown as typeof Image;
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    vi.restoreAllMocks();
  });

  it("should extract RGB color from 1x1 image canvas successfully", async () => {
    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray([255, 128, 64, 255]),
      }),
    };

    let mockCanvasElement: HTMLCanvasElement | null = null;

    vi.spyOn(document, "createElement").mockImplementation(tagName => {
      if (tagName === "canvas") {
        mockCanvasElement = {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(mockContext),
        } as unknown as HTMLCanvasElement;

        return mockCanvasElement;
      }

      return document.createElement(tagName);
    });

    const promise = getImageColor("https://example.com/avatar.jpg");
    expect(mockImageInstance.src).toBe("https://example.com/avatar.jpg");

    mockImageInstance.onload!();
    const result = await promise;

    expect(mockCanvasElement?.width).toBe(1);
    expect(mockCanvasElement?.height).toBe(1);

    expect(mockContext.drawImage).toHaveBeenCalledWith(
      mockImageInstance,
      0,
      0,
      1,
      1,
    );

    expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 1, 1);
    expect(result).toBe("rgb(255, 128, 64)");
  });

  it("should reject when 2D canvas context is not supported", async () => {
    vi.spyOn(document, "createElement").mockImplementation(tagName => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(null),
        } as unknown as HTMLCanvasElement;
      }

      return document.createElement(tagName);
    });

    const promise = getImageColor("https://example.com/avatar.jpg");
    mockImageInstance.onload!();

    await expect(promise).rejects.toBe("Canvas context not supported");
  });

  it("should reject when image fails to load (onerror)", async () => {
    const promise = getImageColor("https://example.com/corrupted.jpg");
    const mockErrorEvent = new ErrorEvent("error", {
      message: "Failed to load resource",
    });

    mockImageInstance.onerror!(mockErrorEvent);
    await expect(promise).rejects.toBe(mockErrorEvent);
  });
});
