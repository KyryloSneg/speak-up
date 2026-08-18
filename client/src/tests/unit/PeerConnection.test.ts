import PeerConnection from "@/services/PeerConnection";
import setupFakeBrowserWebRTCEngine, {
  MockRTCPeerConnection,
} from "@/tests/utils/setupFakeBrowserWebRTCEngine";
import { PeerConnectionEvents } from "@/types/webrtc";
import startOptimizingScreenSharingVideo from "@/utils/startOptimizingScreenSharingVideo";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/startOptimizingScreenSharingVideo", () => ({
  default: vi.fn(),
}));

vi.mock("@/utils/optimizeAudioSdp", () => ({
  default: vi.fn((sdp: string) => sdp),
}));

describe("PeerConnection", () => {
  const REMOTE_ID = "remote-peer-123";

  function createMockTrack(
    kind: "video" | "audio",
    id = `track-${Math.random()}`,
  ) {
    return {
      id,
      kind,
      contentHint: "",
      readyState: "live",
      onended: null,
    } as unknown as MediaStreamTrack;
  }

  function createMockStream(
    id = `stream-${Math.random()}`,
    tracks: MediaStreamTrack[] = [],
  ) {
    return {
      id,
      getTracks: () => tracks,
      getVideoTracks: () => tracks.filter(t => t.kind === "video"),
      getAudioTracks: () => tracks.filter(t => t.kind === "audio"),
    } as unknown as MediaStream;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setupFakeBrowserWebRTCEngine();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization and lifecycle", () => {
    it("should initialize with default properties", () => {
      const pc = new PeerConnection(REMOTE_ID, true);

      expect(pc.remoteId).toBe(REMOTE_ID);
      expect(pc.polite).toBe(true);
      expect(pc.pc).toBeNull();
      expect(pc.userMediaVideoSender).toBeNull();
      expect(pc.userMediaAudioSender).toBeNull();
    });

    it("should create RTCPeerConnection instance on start()", () => {
      const pc = new PeerConnection(REMOTE_ID, true);
      pc.start();

      expect(pc.pc).toBeInstanceOf(MockRTCPeerConnection);
    });

    it("should clean up connection and listeners on stop()", () => {
      const pc = new PeerConnection(REMOTE_ID, true);
      pc.start();

      const emitSpy = vi.spyOn(pc, "off");
      const closeSpy = vi.spyOn(pc.pc!, "close");

      pc.stop();

      expect(closeSpy).toHaveBeenCalledOnce();
      expect(pc.pc).toBeNull();
      expect(pc.userMediaVideoSender).toBeNull();
      expect(pc.userMediaAudioSender).toBeNull();
      expect(emitSpy).toHaveBeenCalledOnce();
    });
  });

  describe("error handling", () => {
    it("should map specific WebRTC error types to corresponding error messages", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const onErrorMock = vi.fn();
      const pc = new PeerConnection(REMOTE_ID, true, { onError: onErrorMock });
      pc.start();

      const invalidStateErr = new Error();
      invalidStateErr.name = "InvalidStateError";

      (pc.pc!.addTrack as any).mockImplementationOnce(() => {
        throw invalidStateErr;
      });

      const videoTrack = createMockTrack("video");
      const stream = createMockStream("stream-1", [videoTrack]);

      pc.localUserMediaStreamEventHandler(stream);
      expect(onErrorMock).toHaveBeenCalledWith({
        error: invalidStateErr,
        message: "Connection state is invalid",
      });
    });
  });

  describe("localUserMediaStreamEventHandler", () => {
    it("should nullify sender tracks when stream is null or has no tracks", async () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const videoTrack = createMockTrack("video");
      const audioTrack = createMockTrack("audio");
      const stream = createMockStream("stream-1", [videoTrack, audioTrack]);

      await pc.localUserMediaStreamEventHandler(stream);
      const replaceVideoSpy = vi.spyOn(
        pc.userMediaVideoSender!,
        "replaceTrack",
      );

      const replaceAudioSpy = vi.spyOn(
        pc.userMediaAudioSender!,
        "replaceTrack",
      );

      await pc.localUserMediaStreamEventHandler(null);

      expect(replaceVideoSpy).toHaveBeenCalledWith(null);
      expect(replaceAudioSpy).toHaveBeenCalledWith(null);
    });

    it("should add tracks and set contentHints during user media initialization", async () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const videoTrack = createMockTrack("video");
      const audioTrack = createMockTrack("audio");
      const stream = createMockStream("stream-1", [videoTrack, audioTrack]);

      await pc.localUserMediaStreamEventHandler(stream);

      expect(videoTrack.contentHint).toBe("motion");
      expect(audioTrack.contentHint).toBe("speech");

      expect(pc.userMediaVideoSender).not.toBeNull();
      expect(pc.userMediaAudioSender).not.toBeNull();
    });

    it("should update bitrate parameters on the audio sender", async () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const audioTrack = createMockTrack("audio");
      const stream = createMockStream("stream-1", [audioTrack]);

      await pc.localUserMediaStreamEventHandler(stream);

      expect(pc.userMediaAudioSender?.setParameters).toHaveBeenCalledWith(
        expect.objectContaining({
          encodings: [
            expect.objectContaining({
              maxBitrate: 128000,
              networkPriority: "high",
              priority: "high",
            }),
          ],
        }),
      );
    });
  });

  describe("localScreenSharingStreamEventHandler", () => {
    it("should add screen share tracks and trigger optimizer utility", () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const videoTrack = createMockTrack("video");
      const stream = createMockStream("screen-stream-1", [videoTrack]);

      pc.localScreenSharingStreamEventHandler(stream);

      expect(pc.localScreenSharingStreamId).toBe("screen-stream-1");
      expect(pc.screenSharingVideoSender).not.toBeNull();
      expect(startOptimizingScreenSharingVideo).toHaveBeenCalledWith(
        videoTrack,
        pc.screenSharingVideoSender,
      );
    });

    it("should remove existing screen share tracks when stream is cleared", () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const videoTrack = createMockTrack("video");
      const stream = createMockStream("screen-stream-1", [videoTrack]);

      pc.localScreenSharingStreamEventHandler(stream);
      const removeTrackSpy = vi.spyOn(pc.pc!, "removeTrack");

      pc.localScreenSharingStreamEventHandler(null);

      expect(removeTrackSpy).toHaveBeenCalled();
      expect(pc.screenSharingVideoSender).toBeNull();
      expect(pc.localScreenSharingStreamId).toBeNull();
    });
  });

  describe("negotiation and signaling", () => {
    it("should handle negotiationneeded and emit local offer", async () => {
      const pc = new PeerConnection(REMOTE_ID, false).start();
      const sdpCb = vi.fn();

      pc.on(PeerConnectionEvents.SDP, sdpCb);
      await pc.pc?.onnegotiationneeded?.(new Event("negotiationneeded"));

      expect(pc.pc?.createOffer).toHaveBeenCalledOnce();
      expect(pc.pc?.setLocalDescription).toHaveBeenCalledOnce();
      expect(sdpCb).toHaveBeenCalledWith({
        sdp: expect.anything(),
        type: "offer",
      });
    });

    it("should ignore incoming offer if impolite and offer collision happens", async () => {
      const pc = new PeerConnection(REMOTE_ID, false).start();
      (pc.pc as any).signalingState = "have-local-offer";

      await pc.setRemoteDescription({ type: "offer", sdp: "dummy-sdp" });
      expect(pc.pc?.setRemoteDescription).not.toHaveBeenCalled();
    });

    it("should rollback local offer if polite and offer collision happens", async () => {
      const pc = new PeerConnection(REMOTE_ID, true).start(); // polite
      (pc.pc as any).signalingState = "have-local-offer";

      await pc.setRemoteDescription({ type: "offer", sdp: "dummy-sdp" });
      expect(pc.pc!.setLocalDescription).toHaveBeenCalledWith({
        type: "rollback",
      });

      expect(pc.pc?.setRemoteDescription).toHaveBeenCalled();
    });

    it("should create answer and emit 'sdp' event when receiving remote offer", async () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const sdpCb = vi.fn();

      pc.on(PeerConnectionEvents.SDP, sdpCb);
      await pc.setRemoteDescription({ type: "offer", sdp: "offer-sdp" });

      expect(pc.pc!.createAnswer).toHaveBeenCalledOnce();
      expect(sdpCb).toHaveBeenCalledWith({
        sdp: expect.anything(),
        type: "answer",
      });
    });
  });

  describe("ice candidates", () => {
    it("should queue candidate if remoteDescription is missing and process it once set", async () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const candidateInit = { candidate: "candidate:123" };

      await pc.addIceCandidate(candidateInit);
      expect(pc.pc!.addIceCandidate).not.toHaveBeenCalled();

      await pc.setRemoteDescription({ type: "offer", sdp: "offer-sdp" });
      expect(pc.pc!.addIceCandidate).toHaveBeenCalledOnce();
    });

    it("should emit 'ice' event when local 'ice' candidate is generated", () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const iceCallback = vi.fn();
      pc.on(PeerConnectionEvents.ICE, iceCallback);

      const candidateObj = { toJSON: () => ({ candidate: "local-candidate" }) };
      pc.pc?.onicecandidate?.({ candidate: candidateObj } as any);

      expect(iceCallback).toHaveBeenCalledWith({
        ice: { candidate: "local-candidate" },
      });
    });
  });

  describe("ontrack", () => {
    it("should emit 'remote user media stream' event for incoming media track", () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      const track = createMockTrack("video");
      const stream = createMockStream("remote-stream", [track]);

      const remoteStreamCallback = vi.fn();
      pc.on(
        PeerConnectionEvents.REMOTE_USER_MEDIA_STREAM,
        remoteStreamCallback,
      );

      pc.pc?.ontrack?.({ track, streams: [stream] } as any);

      expect(remoteStreamCallback).toHaveBeenCalledWith(stream);
      expect(track.contentHint).toBe("motion");
    });

    it("should emit 'remote screen sharing stream' event if stream matches remoteScreenSharingStreamId", () => {
      const pc = new PeerConnection(REMOTE_ID, true).start();
      pc.remoteScreenSharingStreamId = "remote-screen-id";

      const track = createMockTrack("video");
      const stream = createMockStream("remote-screen-id", [track]);

      const screenStreamCallback = vi.fn();
      pc.on(
        PeerConnectionEvents.REMOTE_SCREEN_SHARING_STREAM,
        screenStreamCallback,
      );

      pc.pc?.ontrack?.({ track, streams: [stream] } as any);
      expect(screenStreamCallback).toHaveBeenCalledWith(stream);
    });
  });
});
