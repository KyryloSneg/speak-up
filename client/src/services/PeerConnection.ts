import Emitter from "@/services/Emitter";
import {
  PeerConnectionEvents,
  type PeerConnectionEventsValue,
} from "@/types/webrtc";
import { PREFERRED_VIDEO_CODECS } from "@/utils/mediaConsts";
import optimizeAudioSdp from "@/utils/optimizeAudioSdp";
import sortByMIMETypes from "@/utils/sortByMIMETypes";
import { WEBRTC_CONFIG } from "@/utils/webrtcConsts";

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

  public userMediaVideoSender: RTCRtpSender | null = null;
  public userMediaAudioSender: RTCRtpSender | null = null;
  public screenSharingVideoSender: RTCRtpSender | null = null;
  public screenSharingAudioSender: RTCRtpSender | null = null;

  public localScreenSharingStreamId: string | null = null;
  public remoteScreenSharingStreamId: string | null = null;

  private makingOffer = false;
  private ignoreOffer = false;
  private isSettingRemoteDescription = false;
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

  private handleError(
    error: unknown,
    fallbackMessage: string,
    customOnError?: PeerConnectionOnError,
  ): void {
    const e = error instanceof Error ? error : new Error(String(error));
    let message = fallbackMessage;

    if (e.name === "InvalidStateError") {
      message = "Connection state is invalid";
    } else if (e.name === "OperationError") {
      message = "Failed to establish or update connection";
    } else if (e.name === "InvalidAccessError") {
      message = "Invalid SDP format or media track config";
    } else if (e.name === "NotSupportedError") {
      message = "Requested media feature or codec is not supported";
    }

    const handler = customOnError || this.onError;
    handler?.({ error: e, message });

    console.error(`[PeerConnection:${this.remoteId}] ${message}:`, e);
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
      console.warn(
        `[PeerConnection:${this.remoteId}] Could not set codec preferences:`,
        e,
      );
    }
  }

  public async localUserMediaStreamEventHandler(
    stream: MediaStream | null,
    onError?: PeerConnectionOnError,
  ): Promise<void> {
    const hasStoppedUserMedia = !stream || !stream.getTracks().length;

    try {
      if (hasStoppedUserMedia) {
        await this.userMediaAudioSender?.replaceTrack(null);
        await this.userMediaVideoSender?.replaceTrack(null);

        return;
      }

      if (!this.pc) return;

      const [videoTrack] = stream.getVideoTracks();
      const [audioTrack] = stream.getAudioTracks();

      if (videoTrack && !this.userMediaVideoSender) {
        videoTrack.contentHint = "motion";
        this.userMediaVideoSender = this.pc.addTrack(videoTrack, stream);
      } else {
        await this.userMediaVideoSender?.replaceTrack(videoTrack || null);
      }

      if (audioTrack && !this.userMediaAudioSender) {
        audioTrack.contentHint = "speech";
        this.userMediaAudioSender = this.pc.addTrack(audioTrack, stream);
      } else {
        await this.userMediaAudioSender?.replaceTrack(audioTrack || null);
      }

      if (this.userMediaAudioSender) {
        const params = this.userMediaAudioSender.getParameters();
        if (!params.encodings || params.encodings.length === 0) {
          params.encodings = [{}];
        }

        params.encodings[0]!.maxBitrate = 128000;
        params.encodings[0]!.networkPriority = "high";
        params.encodings[0]!.priority = "high";

        await this.userMediaAudioSender.setParameters(params).catch(() => {});
      }

      this.applyCodecPreferences();
    } catch (e) {
      this.handleError(e, "Failed to update local user media tracks", onError);
    }
  }

  public localScreenSharingStreamEventHandler(
    stream: MediaStream | null,
    onError?: PeerConnectionOnError,
  ): void {
    this.localScreenSharingStreamId = stream?.id || null;
    const hasStoppedScreenSharing = !stream || !stream.getTracks().length;

    try {
      if (hasStoppedScreenSharing) {
        if (this.pc && this.screenSharingAudioSender) {
          this.pc.removeTrack(this.screenSharingAudioSender);
          this.screenSharingAudioSender = null;
        }

        if (this.pc && this.screenSharingVideoSender) {
          this.pc.removeTrack(this.screenSharingVideoSender);
          this.screenSharingVideoSender = null;
        }

        return;
      }

      if (!this.pc) return;

      const [videoTrack] = stream.getVideoTracks();
      const [audioTrack] = stream.getAudioTracks();

      if (videoTrack) {
        videoTrack.contentHint = "detail";

        if (this.screenSharingVideoSender) {
          this.pc.removeTrack(this.screenSharingVideoSender);
        }

        this.screenSharingVideoSender = this.pc.addTrack(videoTrack, stream);
      }

      if (audioTrack) {
        if (this.screenSharingAudioSender) {
          audioTrack.contentHint = "music";
          this.pc.removeTrack(this.screenSharingAudioSender);
        }

        this.screenSharingAudioSender = this.pc.addTrack(audioTrack, stream);
      }

      this.applyCodecPreferences();
    } catch (e) {
      this.handleError(e, "Failed to update screen sharing tracks", onError);
    }
  }

  public start(onError?: PeerConnectionOnError): this {
    try {
      this.pc = new RTCPeerConnection(WEBRTC_CONFIG);

      this.pc.onnegotiationneeded = async () => {
        if (this.isSettingRemoteDescription) return;
        if (
          this.polite &&
          (!this.pc?.remoteDescription || this.pc?.signalingState !== "stable")
        ) {
          return;
        }

        try {
          this.makingOffer = true;
          if (!this.pc) return;

          const offer = await this.pc.createOffer();
          if (!offer.sdp) return;

          const optimizedSdp = optimizeAudioSdp(offer.sdp);
          const localOffer: RTCSessionDescriptionInit = {
            type: "offer",
            sdp: optimizedSdp,
          };

          await this.pc.setLocalDescription(localOffer);

          if (this.pc.signalingState !== "have-local-offer") {
            return;
          }

          this.emit(PeerConnectionEvents.SDP, {
            sdp: this.pc.localDescription || localOffer,
            type: "offer",
          });
        } catch (e) {
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

      this.pc.onsignalingstatechange = () => {
        if (this.pc?.signalingState === "stable") {
          this.pc.getSenders().forEach(sender => {
            if (sender.track?.kind !== "video") return;

            try {
              const params = sender.getParameters();
              if (params.encodings && params.encodings.length > 0) {
                params.encodings.forEach(encoding => {
                  encoding.maxBitrate = 500000;
                });

                sender.setParameters(params).catch(() => {});
              }
            } catch {}
          });
        }
      };

      this.pc.ontrack = event => {
        const stream = event.streams[0] || new MediaStream([event.track]);

        const videoTrack = event.track.kind === "video" ? event.track : null;
        const audioTrack = event.track.kind === "audio" ? event.track : null;

        const isScreenShare =
          !!this.remoteScreenSharingStreamId &&
          stream.id === this.remoteScreenSharingStreamId;

        if (videoTrack) {
          videoTrack.contentHint = isScreenShare ? "detail" : "motion";
        }

        if (audioTrack) {
          audioTrack.contentHint = isScreenShare ? "music" : "speech";
        }

        if (videoTrack) {
          videoTrack.onended = () => {
            if (isScreenShare) {
              this.emit(
                PeerConnectionEvents.REMOTE_SCREEN_SHARING_STREAM,
                null,
              );
            }
          };
        }

        if (isScreenShare) {
          this.emit(PeerConnectionEvents.REMOTE_SCREEN_SHARING_STREAM, stream);
        } else {
          this.emit(PeerConnectionEvents.REMOTE_USER_MEDIA_STREAM, stream);
        }
      };
    } catch (e) {
      this.handleError(e, "Failed to initialize peer connection", onError);
    }

    return this;
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

    this.userMediaVideoSender = null;
    this.userMediaAudioSender = null;
    this.screenSharingVideoSender = null;
    this.screenSharingAudioSender = null;
    this.iceCandidateQueue = [];

    this.off();

    return this;
  }

  public async setRemoteDescription(
    desc: RTCSessionDescriptionInit,
    onError?: PeerConnectionOnError,
  ): Promise<this> {
    if (!this.pc) return this;

    const offerCollision =
      desc.type === "offer" &&
      (this.makingOffer || this.pc.signalingState !== "stable");

    this.ignoreOffer = !this.polite && offerCollision;
    if (this.ignoreOffer) return this;

    try {
      this.isSettingRemoteDescription = true;
      if (offerCollision) {
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
    }

    return this;
  }

  public async addIceCandidate(
    candidate: RTCIceCandidateInit | "",
    onError?: PeerConnectionOnError,
  ): Promise<this> {
    if (!candidate) return this;

    if (!this.pc || !this.pc.remoteDescription) {
      this.iceCandidateQueue.push(candidate);
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
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();

      if (candidate && this.pc) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          if (!this.ignoreOffer) {
            this.handleError(e, "Error processing ICE candidate", onError);
          }
        }
      }
    }
  }
}

export default PeerConnection;
