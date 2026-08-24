import Emitter from "@/services/Emitter";
import getWebRTCConfig from "@/services/webrtcConfig";
import {
  PeerConnectionEvents,
  type PeerConnectionEventsValue,
} from "@/types/webrtc";
import { PREFERRED_VIDEO_CODECS } from "@/utils/mediaConsts";
import optimizeAudioSdp from "@/utils/optimizeAudioSdp";
import sortByMIMETypes from "@/utils/sortByMIMETypes";
import startOptimizingScreenSharingVideo from "@/utils/startOptimizingScreenSharingVideo";

export type PeerConnectionOnError = (info: {
  error: Error | null;
  message: string;
}) => void;

export interface PeerConnectionOptions {
  onError?: PeerConnectionOnError;
}

class PeerConnection extends Emitter<PeerConnectionEventsValue> {
  public remoteId: string;
  public polite: boolean;
  public pc: RTCPeerConnection | null = null;
  private initPromise: Promise<void> | null = null;

  public userMediaVideoSender: RTCRtpSender | null = null;
  public userMediaAudioSender: RTCRtpSender | null = null;
  public screenSharingVideoSender: RTCRtpSender | null = null;
  public screenSharingAudioSender: RTCRtpSender | null = null;

  public localScreenSharingStreamId: string | null = null;
  public remoteScreenSharingStreamId: string | null = null;

  private currentLocalUserMediaStream: MediaStream | null = null;
  private currentLocalScreenSharingStream: MediaStream | null = null;

  private remoteUserMediaStream: MediaStream = new MediaStream();
  private remoteScreenSharingStream: MediaStream = new MediaStream();

  private makingOffer = false;
  private ignoreOffer = false;
  private isSettingRemoteDescription = false;
  private negotiationNeeded = false;
  private remoteDescVersion = 0;
  private iceCandidateQueue: RTCIceCandidateInit[] = [];
  private onError?: PeerConnectionOnError;

  constructor(
    remoteId: string,
    polite: boolean,
    options: PeerConnectionOptions = {},
  ) {
    super();
    this.remoteId = remoteId;
    this.polite = polite;
    this.onError = options.onError;
  }

  private log(category: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString().substring(11, 23);
    const prefix = `[${timestamp}] [PeerConnection:${this.remoteId}] [${category}]`;
    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) await this.initPromise;
  }

  private handleError(
    error: unknown,
    fallbackMessage: string,
    customOnError?: PeerConnectionOnError,
  ): void {
    const e = error instanceof Error ? error : new Error(String(error));
    this.log(
      "ERROR",
      `${fallbackMessage} | Error: ${e.name} - ${e.message}`,
      e,
    );
    const handler = customOnError || this.onError;
    handler?.({ error: e, message: fallbackMessage });
  }

  private ensureTransceiverSending(sender: RTCRtpSender | null): void {
    if (!this.pc || !sender) return;
    const transceiver = this.pc
      .getTransceivers()
      .find(t => t.sender === sender);

    if (transceiver && transceiver.direction !== "sendrecv") {
      transceiver.direction = "sendrecv";
    }
  }

  private applyCodecPreferences(): void {
    if (!this.pc || !RTCRtpReceiver.getCapabilities) return;
    try {
      const supportedCodecs =
        RTCRtpReceiver.getCapabilities("video")?.codecs || [];
      if (!supportedCodecs.length) return;
      const sortedCodecs = sortByMIMETypes(
        supportedCodecs,
        PREFERRED_VIDEO_CODECS,
      );

      this.pc.getTransceivers().forEach(transceiver => {
        if (
          transceiver.receiver?.track?.kind === "video" ||
          transceiver.sender?.track?.kind === "video"
        ) {
          transceiver.setCodecPreferences(sortedCodecs);
        }
      });
    } catch (e) {
      this.log("CODECS", "Could not set codec preferences", e);
    }
  }

  private checkAndTriggerPendingNegotiation(): void {
    if (this.pc?.signalingState === "stable") {
      this.ignoreOffer = false;
      if (this.negotiationNeeded) {
        this.negotiationNeeded = false;
        this.log("SDP_LOCAL", "Triggering queued negotiation");
        this.pc.dispatchEvent(new Event("negotiationneeded"));
      }
    }
  }

  public start(onError?: PeerConnectionOnError): this {
    this.initPromise = (async () => {
      try {
        const webRTCConfig = await getWebRTCConfig();
        this.pc = new RTCPeerConnection(webRTCConfig);

        this.pc.onsignalingstatechange = () => {
          this.checkAndTriggerPendingNegotiation();
        };

        this.pc.oniceconnectionstatechange = () => {
          if (this.pc?.iceConnectionState === "failed") {
            this.pc?.restartIce();
          }
        };

        this.pc.onconnectionstatechange = () => {
          if (this.pc?.connectionState === "failed") {
            this.handleError(
              new Error("Peer connection failed"),
              "Peer connection failed to establish",
              onError,
            );
          }
        };

        this.pc.onnegotiationneeded = async () => {
          if (
            this.makingOffer ||
            this.isSettingRemoteDescription ||
            !this.pc ||
            this.pc.signalingState !== "stable"
          ) {
            this.log(
              "SDP_LOCAL",
              "Negotiation needed event queued (connection busy/unstable)",
            );
            this.negotiationNeeded = true;
            return;
          }

          const versionBeforeOffer = this.remoteDescVersion;

          try {
            this.makingOffer = true;
            const offer = await this.pc.createOffer();

            if (
              this.pc.signalingState !== "stable" ||
              this.remoteDescVersion !== versionBeforeOffer
            ) {
              this.log(
                "SDP_LOCAL",
                "Remote description applied during offer creation; aborting local offer.",
              );
              return;
            }

            const optimizedSdp = optimizeAudioSdp(offer.sdp || "");
            const localOffer: RTCSessionDescriptionInit = {
              type: "offer",
              sdp: optimizedSdp,
            };

            await this.pc.setLocalDescription(localOffer);

            this.emit(PeerConnectionEvents.SDP, {
              sdp: this.pc.localDescription || localOffer,
              type: "offer",
            });
          } catch (e) {
            if (this.pc?.signalingState !== "stable") {
              this.log(
                "SDP_LOCAL",
                "Offer creation aborted due to state change.",
              );
              return;
            }
            this.handleError(
              e,
              "Error during negotiation offer creation",
              onError,
            );
          } finally {
            this.makingOffer = false;
          }
        };

        this.pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            this.emit(PeerConnectionEvents.ICE, { ice: candidate.toJSON() });
          }
        };

        this.pc.ontrack = event => {
          const track = event.track;
          const isScreenShare =
            !!this.remoteScreenSharingStreamId &&
            (event.streams[0]?.id === this.remoteScreenSharingStreamId ||
              track.id === this.remoteScreenSharingStreamId);

          const targetStream = isScreenShare
            ? this.remoteScreenSharingStream
            : this.remoteUserMediaStream;

          if (!targetStream.getTracks().some(t => t.id === track.id)) {
            targetStream.addTrack(track);
          }

          const videoTrack = track.kind === "video" ? track : null;
          const audioTrack = track.kind === "audio" ? track : null;

          if (videoTrack && !isScreenShare) videoTrack.contentHint = "motion";
          if (audioTrack)
            audioTrack.contentHint = isScreenShare ? "music" : "speech";

          const emitStreamUpdate = () => {
            const freshStream = new MediaStream(targetStream.getTracks());
            if (isScreenShare) {
              this.emit(
                PeerConnectionEvents.REMOTE_SCREEN_SHARING_STREAM,
                freshStream,
              );
            } else {
              this.emit(
                PeerConnectionEvents.REMOTE_USER_MEDIA_STREAM,
                freshStream,
              );
            }
          };

          track.onmute = () =>
            this.log("TRACK_STATE", `Track muted: ${track.id}`);
          track.onunmute = () => {
            this.log("TRACK_STATE", `Track unmuted: ${track.id}`);
            emitStreamUpdate();
          };

          emitStreamUpdate();
        };

        if (this.currentLocalUserMediaStream) {
          await this.applyLocalUserMediaStream(
            this.currentLocalUserMediaStream,
            onError,
          );
        }
        if (this.currentLocalScreenSharingStream) {
          await this.applyLocalScreenSharingStream(
            this.currentLocalScreenSharingStream,
            onError,
          );
        }
      } catch (e) {
        this.handleError(e, "Failed to initialize peer connection", onError);
      }
    })();

    return this;
  }

  public async setRemoteDescription(
    desc: RTCSessionDescriptionInit,
    onError?: PeerConnectionOnError,
  ): Promise<this> {
    await this.ensureInitialized();
    if (!this.pc) return this;

    const offerCollision =
      desc.type === "offer" &&
      (this.makingOffer || this.pc.signalingState !== "stable");

    this.ignoreOffer = !this.polite && offerCollision;

    if (this.ignoreOffer) {
      this.log("SDP_REMOTE", "Ignoring incoming offer (Impolite peer glare)");
      return this;
    }

    this.remoteDescVersion++;

    try {
      this.isSettingRemoteDescription = true;

      if (offerCollision && this.pc.signalingState !== "stable") {
        this.iceCandidateQueue = [];
        await this.pc.setLocalDescription({ type: "rollback" });
      }

      await this.pc.setRemoteDescription(new RTCSessionDescription(desc));

      if (desc.type === "offer") {
        const answer = await this.pc.createAnswer();
        if (!answer.sdp) return this;

        const optimizedSdp = optimizeAudioSdp(answer.sdp);
        const localAnswer: RTCSessionDescriptionInit = {
          type: "answer",
          sdp: optimizedSdp,
        };

        await this.pc.setLocalDescription(localAnswer);
        this.emit(PeerConnectionEvents.SDP, {
          sdp: this.pc.localDescription || localAnswer,
          type: "answer",
        });
      }

      await this.processIceCandidateQueue(onError);
    } catch (e) {
      this.handleError(e, "Failed to set remote description", onError);
    } finally {
      this.isSettingRemoteDescription = false;
      this.checkAndTriggerPendingNegotiation();
    }

    return this;
  }

  public async addIceCandidate(
    candidate: RTCIceCandidateInit | "",
    onError?: PeerConnectionOnError,
  ): Promise<this> {
    if (!candidate) return this;
    await this.ensureInitialized();
    if (!this.pc) return this;

    if (!this.pc.remoteDescription || !this.pc.remoteDescription.type) {
      if (!this.ignoreOffer) {
        this.iceCandidateQueue.push(candidate);
      } else {
        this.log("ICE_REMOTE", "Dropped ICE candidate for ignored offer");
      }
      return this;
    }

    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      if (!this.ignoreOffer) {
        this.handleError(e, "Failed to add ICE candidate", onError);
      }
    }

    return this;
  }

  private async processIceCandidateQueue(
    onError?: PeerConnectionOnError,
  ): Promise<void> {
    if (this.iceCandidateQueue.length === 0) return;

    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      if (candidate && this.pc && this.pc.remoteDescription) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          if (!this.ignoreOffer) {
            this.handleError(e, "Error applying queued ICE candidate", onError);
          }
        }
      }
    }
  }

  public async localUserMediaStreamEventHandler(
    stream: MediaStream | null,
    onError?: PeerConnectionOnError,
  ): Promise<void> {
    this.currentLocalUserMediaStream = stream;
    await this.ensureInitialized();
    if (!this.pc) return;
    await this.applyLocalUserMediaStream(stream, onError);
  }

  private async applyLocalUserMediaStream(
    stream: MediaStream | null,
    onError?: PeerConnectionOnError,
  ): Promise<void> {
    if (!this.pc) return;

    try {
      if (!stream || !stream.getTracks().length) {
        if (this.userMediaAudioSender)
          await this.userMediaAudioSender.replaceTrack(null);
        if (this.userMediaVideoSender)
          await this.userMediaVideoSender.replaceTrack(null);
        return;
      }

      const [videoTrack] = stream.getVideoTracks();
      const [audioTrack] = stream.getAudioTracks();

      if (videoTrack) videoTrack.contentHint = "motion";
      if (audioTrack) audioTrack.contentHint = "speech";

      let tracksChanged = false;

      if (videoTrack && !this.userMediaVideoSender) {
        this.userMediaVideoSender = this.pc.addTrack(videoTrack, stream);
        tracksChanged = true;
      } else if (this.userMediaVideoSender) {
        await this.userMediaVideoSender.replaceTrack(videoTrack || null);
      }

      if (audioTrack && !this.userMediaAudioSender) {
        this.userMediaAudioSender = this.pc.addTrack(audioTrack, stream);
        tracksChanged = true;
      } else if (this.userMediaAudioSender) {
        await this.userMediaAudioSender.replaceTrack(audioTrack || null);
      }

      this.ensureTransceiverSending(this.userMediaVideoSender);
      this.ensureTransceiverSending(this.userMediaAudioSender);
      this.applyCodecPreferences();

      // If tracks were updated via replaceTrack, explicitly queue negotiation
      if (!tracksChanged) {
        this.negotiationNeeded = true;
        this.checkAndTriggerPendingNegotiation();
      }
    } catch (e) {
      this.handleError(e, "Failed to update local user media tracks", onError);
    }
  }

  public async localScreenSharingStreamEventHandler(
    stream: MediaStream | null,
    onError?: PeerConnectionOnError,
  ): Promise<void> {
    this.currentLocalScreenSharingStream = stream;
    await this.ensureInitialized();
    if (!this.pc) return;
    await this.applyLocalScreenSharingStream(stream, onError);
  }

  private async applyLocalScreenSharingStream(
    stream: MediaStream | null,
    onError?: PeerConnectionOnError,
  ): Promise<void> {
    if (!this.pc) return;

    this.localScreenSharingStreamId = stream?.id || null;

    try {
      if (!stream || !stream.getTracks().length) {
        if (this.screenSharingAudioSender)
          await this.screenSharingAudioSender.replaceTrack(null);
        if (this.screenSharingVideoSender)
          await this.screenSharingVideoSender.replaceTrack(null);
        return;
      }

      const [videoTrack] = stream.getVideoTracks();
      const [audioTrack] = stream.getAudioTracks();

      let tracksChanged = false;

      if (videoTrack && !this.screenSharingVideoSender) {
        this.screenSharingVideoSender = this.pc.addTrack(videoTrack, stream);
        tracksChanged = true;
      } else if (this.screenSharingVideoSender) {
        await this.screenSharingVideoSender.replaceTrack(videoTrack || null);
      }

      if (this.screenSharingVideoSender && videoTrack) {
        startOptimizingScreenSharingVideo(
          videoTrack,
          this.screenSharingVideoSender,
        );
      }

      if (audioTrack) audioTrack.contentHint = "music";

      if (audioTrack && !this.screenSharingAudioSender) {
        this.screenSharingAudioSender = this.pc.addTrack(audioTrack, stream);
        tracksChanged = true;
      } else if (this.screenSharingAudioSender) {
        await this.screenSharingAudioSender.replaceTrack(audioTrack || null);
      }

      this.ensureTransceiverSending(this.screenSharingVideoSender);
      this.ensureTransceiverSending(this.screenSharingAudioSender);
      this.applyCodecPreferences();

      if (!tracksChanged) {
        this.negotiationNeeded = true;
        this.checkAndTriggerPendingNegotiation();
      }
    } catch (e) {
      this.handleError(e, "Failed to update screen sharing tracks", onError);
    }
  }

  public stop(): this {
    if (this.pc) {
      this.pc.onnegotiationneeded = null;
      this.pc.onicecandidate = null;
      this.pc.onsignalingstatechange = null;
      this.pc.oniceconnectionstatechange = null;
      this.pc.onconnectionstatechange = null;
      this.pc.ontrack = null;
      this.pc.close();
      this.pc = null;
    }

    this.remoteUserMediaStream.getTracks().forEach(t => t.stop());
    this.remoteScreenSharingStream.getTracks().forEach(t => t.stop());
    this.remoteUserMediaStream = new MediaStream();
    this.remoteScreenSharingStream = new MediaStream();

    this.userMediaVideoSender = null;
    this.userMediaAudioSender = null;
    this.screenSharingVideoSender = null;
    this.screenSharingAudioSender = null;
    this.currentLocalUserMediaStream = null;
    this.currentLocalScreenSharingStream = null;
    this.iceCandidateQueue = [];
    this.negotiationNeeded = false;
    this.off();

    return this;
  }
}

export default PeerConnection;
