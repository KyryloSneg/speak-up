import optimizeAudioSdp from "@/utils/optimizeAudioSdp";
import { describe, expect, it } from "vitest";

describe("optimizeAudioSdp", () => {
  it("should return the unchanged SDP if the Opus codec is not present", () => {
    const sdp = [
      "v=0",
      "m=audio 9 UDP/TLS/RTP/SAVPF 103",
      "a=rtpmap:103 ISAC/16000",
      "a=sendrecv",
    ].join("\r\n");

    const result = optimizeAudioSdp(sdp);
    expect(result).toBe(sdp);
  });

  it("should append a new a=fmtp line directly after a=rtpmap if no existing fmtp line is found", () => {
    const sdp = [
      "v=0",
      "m=audio 9 UDP/TLS/RTP/SAVPF 111",
      "a=rtpmap:111 opus/48000/2",
      "a=sendrecv",
    ].join("\r\n");

    const result = optimizeAudioSdp(sdp);

    expect(result).toMatch(/a=rtpmap:111 opus\/48000\/2[\r\n]+a=fmtp:111 /);
    expect(result).toContain("maxaveragebitrate=192000");
    expect(result).toContain("stereo=1");
    expect(result).toContain("sprop-stereo=1");
    expect(result).toContain("usedtx=0");
    expect(result).toContain("useinbandfec=1");
    expect(result).toContain("cbr=0");
    expect(result).toContain("sprop-maxcapturerate=48000");
    expect(result).toContain("maxplaybackrate=48000");
  });

  it("should merge parameters and override existing target parameters if an fmtp line already exists", () => {
    const sdp = [
      "v=0",
      "m=audio 9 UDP/TLS/RTP/SAVPF 111",
      "a=rtpmap:111 opus/48000/2",
      "a=fmtp:111 minptime=10;useinbandfec=0;stereo=0",
      "a=sendrecv",
    ].join("\r\n");

    const result = optimizeAudioSdp(sdp);
    expect(result).toContain("minptime=10");

    expect(result).toContain("useinbandfec=1");
    expect(result).not.toContain("useinbandfec=0");

    expect(result).toContain("stereo=1");
    expect(result).not.toContain("stereo=0");
  });

  it("should correctly identify dynamic payload types (e.g., payload type 96)", () => {
    const sdp = [
      "v=0",
      "a=rtpmap:96 opus/48000/2",
      "a=fmtp:96 minptime=20",
    ].join("\r\n");

    const result = optimizeAudioSdp(sdp);

    expect(result).toContain("a=fmtp:96 ");
    expect(result).toContain("minptime=20");
    expect(result).toContain("maxaveragebitrate=192000");
  });

  it("should match Opus codec case-insensitively", () => {
    const sdp = ["v=0", "a=rtpmap:111 OPUS/48000/2"].join("\r\n");
    const result = optimizeAudioSdp(sdp);

    expect(result).toContain("a=fmtp:111 ");
    expect(result).toContain("stereo=1");
  });

  it("should preserve flags without values from existing fmtp strings", () => {
    const sdp = [
      "v=0",
      "a=rtpmap:111 opus/48000/2",
      "a=fmtp:111 customflag;minptime=10",
    ].join("\r\n");

    const result = optimizeAudioSdp(sdp);

    expect(result).toContain("customflag;");
    expect(result).toContain("minptime=10");
  });
});
