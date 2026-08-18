import copyToClipboard from "@/services/copyToClipboard";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("copyToClipboard", () => {
  const mockWriteText = vi.fn();
  const mockWrite = vi.fn();

  beforeEach(() => {
    mockWriteText.mockReset();
    mockWrite.mockReset();

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: mockWriteText,
        write: mockWrite,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("string copying", () => {
    it("should call navigator.clipboard.writeText and trigger onSuccess", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);

      const onSuccess = vi.fn();
      await copyToClipboard("hello world", { onSuccess });

      expect(mockWriteText).toHaveBeenCalledWith("hello world");
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("should complete successfully without providing options", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);

      await expect(copyToClipboard("hello world")).resolves.not.toThrow();
      expect(mockWriteText).toHaveBeenCalledWith("hello world");
    });
  });

  describe("ClipboardItem copying", () => {
    it("should call navigator.clipboard.write with array of items and trigger onSuccess", async () => {
      mockWrite.mockResolvedValueOnce(undefined);

      const onSuccess = vi.fn();
      const mockClipboardItem = {} as ClipboardItem;

      await copyToClipboard(mockClipboardItem, { onSuccess });

      expect(mockWrite).toHaveBeenCalledWith([mockClipboardItem]);
      expect(mockWrite).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("should call onError when writeText rejects", async () => {
      const error = new Error("Permission denied");
      mockWriteText.mockRejectedValueOnce(error);

      const onError = vi.fn();
      await copyToClipboard("hello world", { onError });

      expect(onError).toHaveBeenCalledWith(error);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("should call onError when write rejects", async () => {
      const error = new Error("Clipboard item failure");
      mockWrite.mockRejectedValueOnce(error);

      const onError = vi.fn();
      const mockClipboardItem = {} as ClipboardItem;

      await copyToClipboard(mockClipboardItem, { onError });

      expect(onError).toHaveBeenCalledWith(error);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("should not throw if onError is null or omitted when an error occurs", async () => {
      mockWriteText.mockRejectedValueOnce(new Error("Clipboard error"));

      await expect(
        copyToClipboard("hello world", { onError: null }),
      ).resolves.not.toThrow();
    });
  });
});
