// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LETTER_PICTURE_SIZE } from "../../utils/consts.ts";
import generateLetterPictureBlob from "../../utils/generateLetterPictureBlob.ts";
import * as getNameInitialsModule from "../../utils/getNameInitials.ts";

vi.mock("../../utils/generateRandomHEX.ts", () => ({
  default: () => "#000000",
}));

const mockCreateCanvas = vi.fn().mockImplementation(() => ({
  getContext: () => ({
    fillRect: vi.fn(),
    fillText: vi.fn(),
    fillStyle: "",
    font: "",
    textAlign: "",
    textBaseline: "",
  }),
  encode: vi
    .fn()
    .mockResolvedValue(new Blob(["Blob bytes"], { type: "image/png" })),
}));

vi.mock("@napi-rs/canvas", () => ({
  createCanvas: (width: number, height: number) =>
    mockCreateCanvas(width, height),
}));

describe("server generateLetterPictureBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful generation", () => {
    async function testSuccessfulGenerationWithCorrectSize(
      size?: number,
    ): Promise<void> {
      const getNameInitialsSpy = vi.spyOn(getNameInitialsModule, "default");

      const name = "Picture Blob";
      const blob = await generateLetterPictureBlob(name, size);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob?.type).toBe("image/png");

      const expectedSize = size ?? LETTER_PICTURE_SIZE;

      expect(mockCreateCanvas).toHaveBeenCalledWith(expectedSize, expectedSize);
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
      mockCreateCanvas.mockReturnValueOnce({
        getContext: () => null,
      } as any);

      const name = "Picture Blob";
      const blob = await generateLetterPictureBlob(name);

      expect(blob).toBeNull();
    });
  });
});
