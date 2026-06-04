// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { LETTER_PICTURE_SIZE } from "../../utils/consts.ts";
import generateLetterPictureBlob from "../../utils/generateLetterPictureBlob.ts";
import * as getNameInitialsModule from "../../utils/getNameInitials.ts";

vi.mock("../../utils/generateRandomHEX.ts", () => ({
  default: () => "#000000",
}));

describe("client generateLetterPictureBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("successful generation", () => {
    async function testSuccessfulGenerationWithCorrectSize(
      size?: number,
    ): Promise<void> {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: () => ({ fillRect: vi.fn(), fillText: vi.fn() }),
        toBlob: (
          callback: (blob: Blob, options?: { type?: string }) => void,
          type?: string,
        ) => {
          callback(new Blob([], { type: type ?? "image/png" }));
        },
      } as const;

      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as any);
      const getNameInitialsSpy = vi.spyOn(getNameInitialsModule, "default");

      const name = "Picture Blob";
      const blob = await generateLetterPictureBlob(name, size);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob?.type).toBe("image/png");

      const expectedSize = size ?? LETTER_PICTURE_SIZE;

      expect(mockCanvas.width).toBe(expectedSize);
      expect(mockCanvas.height).toBe(expectedSize);

      expect(document.createElement).toHaveBeenCalledWith("canvas");
      expect(getNameInitialsSpy).toHaveBeenCalledWith(name);
    }

    it("should generate a proper .png using default size with correct name initials", async () => {
      await testSuccessfulGenerationWithCorrectSize();
    });

    it("should generate a proper .png using custom size with correct name initials", async () => {
      await testSuccessfulGenerationWithCorrectSize(100);
    });
  });

  describe("unsuccessful generation", () => {
    it("should fallback to null if canvas context encounters an unexpected error", async () => {
      vi.spyOn(document, "createElement").mockReturnValue({
        getContext: () => null,
      } as any);

      const name = "Picture Blob";
      const blob = await generateLetterPictureBlob(name);

      expect(blob).toBeNull();
    });
  });
});
