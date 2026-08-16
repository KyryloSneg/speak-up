import { vi } from "vitest";

export class MockRTCRtpSender {
  public track: MediaStreamTrack | null = null;
  public getParameters = vi.fn().mockReturnValue({ encodings: [{}] });
  public setParameters = vi.fn().mockResolvedValue(undefined);
  public replaceTrack = vi
    .fn()
    .mockImplementation(async (track: MediaStreamTrack | null) => {
      this.track = track;
    });

  constructor(track: MediaStreamTrack | null = null) {
    this.track = track;
  }
}

export class MockRTCRtpTransceiver {
  public receiver = { track: null as MediaStreamTrack | null };
  public sender = new MockRTCRtpSender();
  public setCodecPreferences = vi.fn();
}

export class MockRTCPeerConnection {
  public signalingState: RTCSignalingState = "stable";
  public connectionState: RTCPeerConnectionState = "new";
  public localDescription: RTCSessionDescriptionInit | null = null;
  public remoteDescription: RTCSessionDescriptionInit | null = null;

  public onnegotiationneeded: (() => void) | null = null;
  public onicecandidate: ((e: { candidate: any }) => void) | null = null;
  public onsignalingstatechange: (() => void) | null = null;
  public ontrack: ((e: any) => void) | null = null;
  public oniceconnectionstatechange: (() => void) | null = null;
  public onconnectionstatechange: (() => void) | null = null;

  public senders: MockRTCRtpSender[] = [];
  public transceivers: MockRTCRtpTransceiver[] = [];

  constructor(public config?: RTCConfiguration) {}

  public addTrack = vi.fn((track: MediaStreamTrack) => {
    const sender = new MockRTCRtpSender(track);
    this.senders.push(sender);

    const transceiver = new MockRTCRtpTransceiver();
    transceiver.sender = sender;
    transceiver.receiver.track = track;
    this.transceivers.push(transceiver);

    return sender;
  });

  public removeTrack = vi.fn((sender: MockRTCRtpSender) => {
    this.senders = this.senders.filter(s => s !== sender);
    this.transceivers = this.transceivers.filter(t => t.sender !== sender);
  });

  public getSenders = vi.fn(() => this.senders);
  public getTransceivers = vi.fn(() => this.transceivers);

  public createOffer = vi.fn().mockResolvedValue({
    type: "offer",
    sdp: "v=0\r\na=rtpmap:111 opus/48000/2",
  });

  public createAnswer = vi.fn().mockResolvedValue({
    type: "answer",
    sdp: "v=0\r\na=rtpmap:111 opus/48000/2",
  });

  public setLocalDescription = vi.fn().mockImplementation(async desc => {
    this.localDescription = desc;

    if (desc.type === "offer") {
      this.signalingState = "have-local-offer";
    } else if (desc.type === "answer" || desc.type === "rollback") {
      this.signalingState = "stable";

      if (desc.type === "rollback") this.localDescription = null;
    }
  });

  public setRemoteDescription = vi.fn().mockImplementation(async desc => {
    this.remoteDescription = desc;

    if (desc.type === "offer") {
      this.signalingState = "have-remote-offer";
    } else if (desc.type === "answer") {
      this.signalingState = "stable";
    }
  });

  public addIceCandidate = vi.fn().mockResolvedValue(undefined);
  public close = vi.fn().mockImplementation(() => {
    this.signalingState = "closed";
  });
}

export default function setupFakeWebRTCEngine() {
  class MockRTCSessionDescription {
    constructor(public init: RTCSessionDescriptionInit) {
      Object.assign(this, init);
    }
  }

  class MockRTCIceCandidate {
    constructor(public init: RTCIceCandidateInit) {
      Object.assign(this, init);
    }

    toJSON() {
      return { candidate: "candidate:12345", sdpMid: "0", sdpMLineIndex: 0 };
    }
  }

  const MockRTCRtpReceiver = {
    getCapabilities: vi.fn().mockReturnValue({
      codecs: [
        { mimeType: "video/VP8", clockRate: 90000 },
        { mimeType: "video/H264", clockRate: 90000 },
        { mimeType: "video/AV1", clockRate: 90000 },
      ],
    }),
  };

  vi.stubGlobal("RTCPeerConnection", MockRTCPeerConnection);
  vi.stubGlobal("RTCSessionDescription", MockRTCSessionDescription);
  vi.stubGlobal("RTCIceCandidate", MockRTCIceCandidate);
  vi.stubGlobal("RTCRtpReceiver", MockRTCRtpReceiver);
}
