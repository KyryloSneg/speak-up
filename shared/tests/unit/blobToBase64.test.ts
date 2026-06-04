import { describe, expect, it } from "vitest";
import blobToBase64 from "../../utils/blobToBase64.ts";

describe("blobToBase64", () => {
  it("should properly convert a string blob to base64 data URL", async () => {
    const blob = new Blob(["text"], { type: "text/plain" });
    const base64 = await blobToBase64(blob);

    expect(base64).toBe("data:text/plain;base64,dGV4dA==");
  });

  it("should properly convert an empty image blob to base64 data URL", async () => {
    const blob = new Blob([], { type: "image/png" });
    const base64 = await blobToBase64(blob);

    expect(base64).toBe("data:image/png;base64,");
  });

  it("should properly convert a binary data blob to base64 data URL", async () => {
    const binaryData = new Uint8Array([0, 1, 2, 3, 254, 255]);
    const blob = new Blob([binaryData], { type: "application/octet-stream" });
    const base64 = await blobToBase64(blob);

    expect(base64).toBe("data:application/octet-stream;base64,AAECA/7/");
  });
});
