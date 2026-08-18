import sortByMIMETypes from "@/utils/sortByMIMETypes";
import { describe, expect, it } from "vitest";

describe("sortByMIMETypes", () => {
  it("should sort codecs according to the preferred MIME type order", () => {
    const codecs = [
      { mimeType: "video/H264" },
      { mimeType: "video/VP8" },
      { mimeType: "video/AV1" },
    ] as RTCRtpCodec[];

    const preferredOrder = ["video/AV1", "video/VP8", "video/H264"];
    const sorted = sortByMIMETypes(codecs, preferredOrder);

    expect(sorted).toEqual([
      { mimeType: "video/AV1" },
      { mimeType: "video/VP8" },
      { mimeType: "video/H264" },
    ]);
  });

  it("should place codecs missing from preferredOrder at the end", () => {
    const codecs = [
      { mimeType: "audio/G722" },
      { mimeType: "audio/opus" },
      { mimeType: "audio/PCMU" },
    ] as RTCRtpCodec[];

    const preferredOrder = ["audio/opus"];
    const sorted = sortByMIMETypes(codecs, preferredOrder);

    expect(sorted[0]).toEqual({ mimeType: "audio/opus" });
    expect(sorted.slice(1)).toEqual([
      { mimeType: "audio/G722" },
      { mimeType: "audio/PCMU" },
    ]);
  });

  it("should not mutate the original codecs array", () => {
    const codecs = [
      { mimeType: "video/H264" },
      { mimeType: "video/VP8" },
    ] as RTCRtpCodec[];

    const preferredOrder = ["video/VP8", "video/H264"];

    const sorted = sortByMIMETypes(codecs, preferredOrder);

    expect(sorted).not.toBe(codecs);
    expect(codecs).toEqual([
      { mimeType: "video/H264" },
      { mimeType: "video/VP8" },
    ]);
  });

  it("should return an empty array if an empty codecs list is provided", () => {
    const sorted = sortByMIMETypes([], ["video/VP8", "video/H264"]);
    expect(sorted).toEqual([]);
  });

  it("should preserve original order if preferredOrder is empty", () => {
    const codecs = [
      { mimeType: "video/VP8" },
      { mimeType: "video/H264" },
    ] as RTCRtpCodec[];

    const sorted = sortByMIMETypes(codecs, []);
    expect(sorted).toEqual([
      { mimeType: "video/VP8" },
      { mimeType: "video/H264" },
    ]);
  });

  it("should preserve codec property data, not just mimeType", () => {
    const codecs = [
      { mimeType: "audio/PCMU", clockRate: 8000, channels: 1 },
      { mimeType: "audio/opus", clockRate: 48000, channels: 2 },
    ] as RTCRtpCodec[];

    const preferredOrder = ["audio/opus", "audio/PCMU"];
    const sorted = sortByMIMETypes(codecs, preferredOrder);

    expect(sorted).toEqual([
      { mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      { mimeType: "audio/PCMU", clockRate: 8000, channels: 1 },
    ]);
  });
});
