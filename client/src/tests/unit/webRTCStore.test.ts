import { useMediaStore } from "@/stores/media";
import { useWebRTCStore } from "@/stores/webrtc";
import mockSocket from "@/tests/unit/utils/mockSocket";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { PeerConnectionEvents } from "@/types/webrtc";
import checkIsPCPolite from "@/utils/checkIsPCPolite";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("vue-sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/utils/checkIsPCPolite", () => ({
  default: vi.fn((remoteId: string) => remoteId === "polite-user"),
}));

vi.mock("@speak-up/shared", async importOriginal => {
  const actual = await importOriginal<typeof import("@speak-up/shared")>();
  return {
    ...actual,
    getZodIceValidation: () => ({
      safeParse: (ice: any) => {
        if (ice?.invalid) return { success: false, error: "Invalid ICE" };
        return { success: true, data: ice };
      },
    }),
  };
});

const MockPeerConnection = vi.hoisted(() => {
  class MockPeerConnection {
    remoteId: string;
    polite: boolean;
    options: { onError: (info: { message: string }) => void };
    eventListeners = new Map<string, ((...args: unknown[]) => void)[]>();
    remoteScreenSharingStreamId?: string;
    localScreenSharingStreamId = "local-screen-sharing-id";

    constructor(
      remoteId: string,
      polite: boolean,
      options: { onError: (info: { message: string }) => void },
    ) {
      this.remoteId = remoteId;
      this.polite = polite;
      this.options = options;
    }

    on = vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }

      this.eventListeners.get(event)!.push(handler);
    });

    trigger(event: string, payload?: unknown) {
      const handlers = this.eventListeners.get(event) || [];
      handlers.forEach(handler => handler(payload));
    }

    start = vi.fn();
    stop = vi.fn();
    setRemoteDescription = vi.fn().mockResolvedValue(undefined);
    addIceCandidate = vi.fn().mockResolvedValue(undefined);
    localUserMediaStreamEventHandler = vi.fn();
    localScreenSharingStreamEventHandler = vi.fn();
  }

  return MockPeerConnection;
});

type MockPC = InstanceType<typeof MockPeerConnection>;

function getMockPC(
  webrtcStore: ReturnType<typeof useWebRTCStore>,
  id: string,
): MockPC {
  return webrtcStore.peerConnections.get(id) as unknown as MockPC;
}

vi.mock("@/services/PeerConnection", () => ({
  default: MockPeerConnection,
}));

describe("webrtcStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();

    mockSocket.resetMock();

    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("bindEvents", () => {
    it("should properly listen to SEND_SDP error event", async () => {
      const webrtcStore = useWebRTCStore();
      const error = "SDP negotiation error";

      webrtcStore.bindEvents();
      webrtcStore.bindEvents();

      await mockSocket.triggerServerEvent(SocketResponseEvents.SEND_SDP, {
        error,
      });

      expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
    });

    it("should properly listen to SEND_ICE error event", async () => {
      const webrtcStore = useWebRTCStore();
      const error = "ICE candidate failed";

      webrtcStore.bindEvents();
      webrtcStore.bindEvents();

      await mockSocket.triggerServerEvent(SocketResponseEvents.SEND_ICE, {
        error,
      });

      expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
    });

    it("should properly listen to RECEIVED_SDP event and set remote description", async () => {
      const webrtcStore = useWebRTCStore();
      const remoteUserId = "remote-1";
      const sdpData = {
        userId: remoteUserId,
        type: "offer" as const,
        sdp: "v=0\r\no=- 123456789...",
        screenSharingStreamId: "screen-stream-123",
      };

      webrtcStore.bindEvents();
      webrtcStore.bindEvents();

      await mockSocket.triggerServerEvent(SocketEvents.RECEIVED_SDP, sdpData);
      const pc = getMockPC(webrtcStore, remoteUserId);

      expect(pc).toBeDefined();
      expect(pc?.remoteScreenSharingStreamId).toBe("screen-stream-123");
      expect(pc?.setRemoteDescription).toHaveBeenCalledWith({
        type: sdpData.type,
        sdp: sdpData.sdp,
      });
    });

    it("should properly listen to RECEIVED_ICE event and add ice candidate", async () => {
      const webrtcStore = useWebRTCStore();
      const remoteUserId = "remote-1";
      const iceData = {
        userId: remoteUserId,
        ice: { candidate: "candidate:123 1 udp ..." },
      };

      webrtcStore.bindEvents();
      webrtcStore.bindEvents();

      await mockSocket.triggerServerEvent(SocketEvents.RECEIVED_ICE, iceData);
      const pc = getMockPC(webrtcStore, remoteUserId);

      expect(pc).toBeDefined();
      expect(pc?.addIceCandidate).toHaveBeenCalledWith(iceData.ice);
    });
  });

  describe("createPeerConnection", () => {
    it("should create new PeerConnection, set initial remote stream, start pc and attach listeners", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "polite-user";

      const pc = webrtcStore.createPeerConnection(remoteId);
      expect(checkIsPCPolite).toHaveBeenCalledWith(remoteId);

      expect(pc?.polite).toBe(true);
      expect(pc?.start).toHaveBeenCalledOnce();

      expect(getMockPC(webrtcStore, remoteId)).toBe(pc);
      expect(webrtcStore.remoteStreams.get(remoteId)).toStrictEqual({
        userMedia: null,
        screenSharing: null,
      });
    });

    it("should return existing PeerConnection if one is already created for the remoteId", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "user-1";

      const pc1 = webrtcStore.createPeerConnection(remoteId);
      const pc2 = webrtcStore.createPeerConnection(remoteId);

      expect(pc1).toBe(pc2);
    });

    it("should attach media streams from mediaStore if they exist on creation", () => {
      const mediaStore = useMediaStore();
      const webrtcStore = useWebRTCStore();

      const userMediaStream = new MediaStream();
      const screenSharingStream = new MediaStream();

      mediaStore.userMediaStream = userMediaStream;
      mediaStore.screenSharingStream = screenSharingStream;

      const pc = webrtcStore.createPeerConnection(
        "user-1",
      ) as unknown as MockPC;

      expect(pc.localUserMediaStreamEventHandler).toHaveBeenCalledWith(
        userMediaStream,
      );

      expect(pc.localScreenSharingStreamEventHandler).toHaveBeenCalledWith(
        screenSharingStream,
      );
    });

    it("should emit SEND_SDP socket event when PeerConnection fires SDP event", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "user-1";
      const pc = webrtcStore.createPeerConnection(
        remoteId,
      ) as unknown as MockPC;

      const payload = {
        type: "offer",
        sdp: { sdp: "sdp-content" },
      };

      pc.trigger(PeerConnectionEvents.SDP, payload);

      expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.SEND_SDP, {
        userId: remoteId,
        sdp: "sdp-content",
        type: "offer",
        screenSharingStreamId: pc.localScreenSharingStreamId,
      });
    });

    it("validate, and emit SEND_ICE when PeerConnection fires ICE event", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "user-1";
      const pc = webrtcStore.createPeerConnection(
        remoteId,
      ) as unknown as MockPC;

      const payload = {
        ice: {
          candidate: "candidate:123",
          usernameFragment: "usernameFragment",
        },
      };

      pc.trigger(PeerConnectionEvents.ICE, payload);

      expect(payload.ice.usernameFragment).toBe("usernameFragment");
      expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.SEND_ICE, {
        userId: remoteId,
        ice: payload.ice,
      });
    });

    it("should not emit SEND_ICE when ICE payload validation fails", () => {
      const webrtcStore = useWebRTCStore();
      const pc = webrtcStore.createPeerConnection(
        "user-1",
      ) as unknown as MockPC;

      pc.trigger(PeerConnectionEvents.ICE, {
        ice: { invalid: true },
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it("should update remoteStreams when PeerConnection fires REMOTE_USER_MEDIA_STREAM event", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "user-1";
      const pc = webrtcStore.createPeerConnection(
        remoteId,
      ) as unknown as MockPC;

      const mockStream = new MediaStream();
      pc.trigger(PeerConnectionEvents.REMOTE_USER_MEDIA_STREAM, mockStream);

      expect(webrtcStore.remoteStreams.get(remoteId)).toStrictEqual({
        userMedia: mockStream,
        screenSharing: null,
      });
    });

    it("should update remoteStreams when PeerConnection fires REMOTE_SCREEN_SHARING_STREAM event", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "user-1";
      const pc = webrtcStore.createPeerConnection(
        remoteId,
      ) as unknown as MockPC;

      const mockScreenStream = new MediaStream();
      pc.trigger(
        PeerConnectionEvents.REMOTE_SCREEN_SHARING_STREAM,
        mockScreenStream,
      );

      expect(webrtcStore.remoteStreams.get(remoteId)).toStrictEqual({
        userMedia: null,
        screenSharing: mockScreenStream,
      });
    });

    it("should preserve existing userMedia stream when REMOTE_SCREEN_SHARING_STREAM is received", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "user-1";

      const pc = webrtcStore.createPeerConnection(
        remoteId,
      ) as unknown as MockPC;

      const userStream = new MediaStream();
      const screenStream = new MediaStream();

      pc.trigger(PeerConnectionEvents.REMOTE_USER_MEDIA_STREAM, userStream);
      pc.trigger(
        PeerConnectionEvents.REMOTE_SCREEN_SHARING_STREAM,
        screenStream,
      );

      expect(webrtcStore.remoteStreams.get(remoteId)).toStrictEqual({
        userMedia: userStream,
        screenSharing: screenStream,
      });
    });

    it("should trigger toast.error when PeerConnection options.onError callback is executed", () => {
      const webrtcStore = useWebRTCStore();
      const pc = webrtcStore.createPeerConnection(
        "user-1",
      ) as unknown as MockPC;

      const errorMessage = "Internal PC Error";
      pc.options.onError({ message: errorMessage });

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe("removePeerConnection", () => {
    it("should stop PC and remove it from peerConnections and remoteStreams maps", () => {
      const webrtcStore = useWebRTCStore();
      const remoteId = "user-1";

      const pc = webrtcStore.createPeerConnection(remoteId);

      expect(webrtcStore.peerConnections.has(remoteId)).toBe(true);
      webrtcStore.removePeerConnection(remoteId);

      expect(pc.stop).toHaveBeenCalledOnce();
      expect(webrtcStore.peerConnections.has(remoteId)).toBe(false);
      expect(webrtcStore.remoteStreams.has(remoteId)).toBe(false);
    });

    it("should safely handle removing non-existent remoteId", () => {
      const webrtcStore = useWebRTCStore();
      expect(() =>
        webrtcStore.removePeerConnection("non-existent"),
      ).not.toThrow();
    });
  });

  describe("sendUserMedia", () => {
    it("should invoke localUserMediaStreamEventHandler on all peer connections", () => {
      const webrtcStore = useWebRTCStore();

      const pc1 = webrtcStore.createPeerConnection("user-1");
      const pc2 = webrtcStore.createPeerConnection("user-2");

      const stream = new MediaStream();
      webrtcStore.sendUserMedia(stream);

      expect(pc1.localUserMediaStreamEventHandler).toHaveBeenCalledWith(stream);
      expect(pc2.localUserMediaStreamEventHandler).toHaveBeenCalledWith(stream);
    });
  });

  describe("sendScreenSharing", () => {
    it("should invoke localScreenSharingStreamEventHandler on all peer connections", () => {
      const webrtcStore = useWebRTCStore();

      const pc1 = webrtcStore.createPeerConnection("user-1");
      const pc2 = webrtcStore.createPeerConnection("user-2");

      const stream = { id: "new-screen-sharing" } as unknown as MediaStream;
      webrtcStore.sendScreenSharing(stream);

      expect(pc1.localScreenSharingStreamEventHandler).toHaveBeenCalledWith(
        stream,
      );

      expect(pc2.localScreenSharingStreamEventHandler).toHaveBeenCalledWith(
        stream,
      );
    });
  });

  describe("stop", () => {
    it("should remove all active peer connections and clear screen sharing announcer text", () => {
      const webrtcStore = useWebRTCStore();

      webrtcStore.sharingScreenAnnouncerText = "User is sharing screen";
      webrtcStore.createPeerConnection("user-1");
      webrtcStore.createPeerConnection("user-2");

      expect(webrtcStore.peerConnections.size).toBe(2);

      webrtcStore.stop();

      expect(webrtcStore.peerConnections.size).toBe(0);
      expect(webrtcStore.remoteStreams.size).toBe(0);
      expect(webrtcStore.sharingScreenAnnouncerText).toBe("");
    });
  });
});
