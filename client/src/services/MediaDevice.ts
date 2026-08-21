import Emitter from "@/services/Emitter";
import { FacingModes, type FacingMode } from "@/types/media";
import {
  MediaDeviceEvents,
  type MediaDeviceEventNames,
} from "@/types/mediaDeviceEvents";
import getMediaTrackDeviceId from "@/utils/getMediaTrackDeviceId";
import inverseFacingMode from "@/utils/inverseFacingMode";
import {
  DEFAULT_AUDIO_CONSTRAINTS,
  DEFAULT_SCREEN_SHARING_CONSTRAINTS,
  DEFAULT_VIDEO_CONSTRAINTS,
} from "@/utils/mediaConsts";
import _ from "lodash";

export type StartUserMediaOnError = (info: {
  error: Error | null;
  message: string;
}) => void;

export interface StartUserMediaOptions {
  audioConstraints?: MediaTrackConstraints;
  videoConstraints?: MediaTrackConstraints;
  disabled?: { audio?: boolean; video?: boolean };
  onError?: StartUserMediaOnError;
}

export const defaultStartUserMediaOptions: StartUserMediaOptions = {
  audioConstraints: DEFAULT_AUDIO_CONSTRAINTS,
  videoConstraints: DEFAULT_VIDEO_CONSTRAINTS,
} as const;

class MediaDevice extends Emitter<MediaDeviceEventNames> {
  protected userMediaStream: MediaStream | null;
  protected prevUserMediaStreamId: string | null;
  protected latestUserMediaStreamId: string | null;

  protected screenSharingStream: MediaStream | null;
  protected prevScreenSharingStreamId: string | null;
  protected latestScreenSharingStreamId: string | null;

  constructor() {
    super();

    this.userMediaStream = null;
    this.prevUserMediaStreamId = null;
    this.latestUserMediaStreamId = null;

    this.screenSharingStream = null;
    this.prevScreenSharingStreamId = null;
    this.latestScreenSharingStreamId = null;
  }

  private addTrack(
    stream: MediaStream | null | undefined,
    track: MediaStreamTrack,
  ): void {
    if (!stream) return;

    stream.addTrack(track);
    stream.dispatchEvent(new CustomEvent("customaddtrack"));
  }

  private removeTrack(
    stream: MediaStream | null | undefined,
    track: MediaStreamTrack,
  ): void {
    if (!stream) return;

    stream.removeTrack(track);
    stream.dispatchEvent(new CustomEvent("customremovetrack"));
  }

  private onStream(
    stream: MediaStream,
    type: "userMedia" | "screenSharing",
  ): void {
    const streamField =
      type === "userMedia" ? "userMediaStream" : "screenSharingStream";

    const prevStreamIdField =
      type === "userMedia"
        ? "prevUserMediaStreamId"
        : "prevScreenSharingStreamId";

    const latestStreamIdField =
      type === "userMedia"
        ? "latestUserMediaStreamId"
        : "latestScreenSharingStreamId";

    const streamEvent =
      type === "userMedia"
        ? MediaDeviceEvents.USER_MEDIA_STREAM
        : MediaDeviceEvents.SCREEN_SHARING_STREAM;

    // if we have already created a media stream, replace its TRACKS with new ones,
    // not the STREAM itself (because otherwise there will be no video and audio for a moment)
    if (this[streamField]) {
      this[prevStreamIdField] = this[latestStreamIdField];

      const oldTracks = [...this[streamField].getTracks()];
      const newTracks = stream.getTracks();

      newTracks.forEach(track => this.addTrack(this[streamField], track));
      const newKinds = new Set(newTracks.map(track => track?.kind));

      oldTracks.forEach(track => {
        if (newKinds.has(track?.kind)) {
          track.stop();
          this.removeTrack(this[streamField], track);
        }
      });
    } else {
      this[streamField] = stream;
    }

    this[latestStreamIdField] = stream.id;
    this.emit(streamEvent, this[streamField]);
  }

  startUserMedia(
    config: { audio: boolean; video: boolean },
    options: StartUserMediaOptions = defaultStartUserMediaOptions,
  ): MediaDevice {
    function getConstraintsToUse(
      constraints: MediaTrackConstraints | undefined,
      defaultConstraints: MediaTrackConstraints,
    ): MediaTrackConstraints {
      return constraints
        ? {
            ...defaultConstraints,
            ...constraints,
          }
        : defaultConstraints;
    }

    const optionsToUse: StartUserMediaOptions = {
      ...defaultStartUserMediaOptions,
      ...options,
      audioConstraints: getConstraintsToUse(
        options.audioConstraints,
        DEFAULT_AUDIO_CONSTRAINTS,
      ),
      videoConstraints: getConstraintsToUse(
        options.videoConstraints,
        DEFAULT_VIDEO_CONSTRAINTS,
      ),
    } as const;

    if (!navigator.mediaDevices?.getUserMedia) {
      optionsToUse?.onError?.({
        error: null,
        message: "Your browser doesn't support recording microphone or camera",
      });

      return this;
    }

    if (config.video || config.audio) {
      const configToUse: {
        audio: MediaTrackConstraints | false;
        video: MediaTrackConstraints | false;
      } = {
        audio: config.audio ? optionsToUse.audioConstraints! : false,
        video: config.video ? optionsToUse.videoConstraints! : false,
      };

      const onOldDevicesCleanup: () => void = () => {
        if (this.userMediaStream) {
          if (configToUse.audio) {
            const oldConstraints = this.userMediaStream
              .getAudioTracks()[0]
              ?.getConstraints();

            const oldDeviceId = getMediaTrackDeviceId(oldConstraints);
            const newDeviceId = getMediaTrackDeviceId(configToUse.audio);

            if (!oldConstraints || newDeviceId !== oldDeviceId) {
              this.userMediaStream.getAudioTracks().forEach(track => {
                track.stop();
                this.removeTrack(this.userMediaStream, track);
              });
            }
          }

          if (configToUse.video) {
            const oldConstraints = this.userMediaStream
              .getVideoTracks()[0]
              ?.getConstraints();

            const oldDeviceId = getMediaTrackDeviceId(oldConstraints);
            const newDeviceId = getMediaTrackDeviceId(configToUse.video);

            if (!oldConstraints || newDeviceId !== oldDeviceId) {
              this.userMediaStream.getVideoTracks().forEach(track => {
                track.stop();
                this.removeTrack(this.userMediaStream, track);
              });
            }
          }
        }
      };

      const baseOnCatch: (error: Error) => void = error => {
        onOldDevicesCleanup();

        if (error.name === "NotFoundError") {
          optionsToUse?.onError?.({
            error,
            message: "Audio or video is not found",
          });
        } else if (error.name === "NotAllowedError") {
          optionsToUse?.onError?.({
            error,
            message: "You have not allowed using camera or microphone",
          });
        } else {
          optionsToUse?.onError?.({
            error,
            message: "Something has gone terribly wrong",
          });
        }

        console.error(error);
      };

      const onStream = (stream: MediaStream) => {
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        audioTracks?.forEach(track => {
          if (options.disabled?.audio) track.enabled = false;
        });

        videoTracks?.forEach(track => {
          if (options.disabled?.video) track.enabled = false;
        });

        this.onStream(stream, "userMedia");
      };

      navigator.mediaDevices
        .getUserMedia(configToUse)
        .then(onStream)
        .catch(error => {
          if (error.name === "NotReadableError" && this.userMediaStream) {
            // parallel user media with other device is unfortunately
            // unsupported by user browser, so cleanup old stream tracks first
            // if the corresponding device is changed
            onOldDevicesCleanup();

            return navigator.mediaDevices
              .getUserMedia(configToUse)
              .then(onStream)
              .catch(baseOnCatch);
          }

          baseOnCatch(error);
        });
    }

    return this;
  }

  startScreenSharing(
    onError: StartUserMediaOnError | null = null,
  ): MediaDevice {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      onError?.({
        error: null,
        message: "Your browser doesn't support sharing screen",
      });

      return this;
    }

    const config: MediaStreamConstraints = DEFAULT_SCREEN_SHARING_CONSTRAINTS;

    const baseOnCatch: (error: Error) => void = error => {
      if (error.name === "NotAllowedError") return;
      if (error.name === "NotFoundError") {
        onError?.({
          error,
          message: "No sources to share",
        });
      } else {
        onError?.({
          error,
          message: "Something has gone terribly wrong",
        });
      }

      console.error(error);
    };

    const onStream = (stream: MediaStream) => {
      this.onStream(stream, "screenSharing");

      // handle "stop sharing screen" button from the browser interface
      const cleanupCb = (): void => {
        // .active property of the stream isn't updated by this moment yet
        const isActive = !!this.screenSharingStream
          ?.getTracks()
          .some(track => track.readyState !== "ended");

        if (!isActive) this.stopScreenSharing();
      };

      this.screenSharingStream
        ?.getTracks()
        .forEach(track => track.addEventListener("ended", cleanupCb));
    };

    navigator.mediaDevices
      .getDisplayMedia(config)
      .then(onStream)
      .catch(baseOnCatch);

    return this;
  }

  toggleUserMedia(
    type: "audio" | "video",
    value: boolean | null = null,
  ): MediaDevice {
    if (this.userMediaStream) {
      function trackCb(track: MediaStreamTrack): void {
        track.enabled = typeof value === "boolean" ? value : !track.enabled;
        track.dispatchEvent(
          new CustomEvent(track.enabled ? "enable" : "disable"),
        );
      }

      const tracks =
        type === "audio"
          ? this.userMediaStream.getAudioTracks()
          : this.userMediaStream.getVideoTracks();

      tracks.forEach(trackCb);
    }

    return this;
  }

  toggleIsCameraFlipped(value: FacingMode | null = null): MediaDevice {
    if (this.userMediaStream) {
      function trackCb(track: MediaStreamTrack): void {
        const currFacingMode = track.getSettings().facingMode as
          | FacingMode
          | undefined;

        track.applyConstraints({
          facingMode:
            value ||
            (currFacingMode
              ? inverseFacingMode(currFacingMode)
              : FacingModes.ENVIRONMENT),
        });
      }

      const tracks = this.userMediaStream.getVideoTracks();
      tracks.forEach(trackCb);
    }

    return this;
  }

  changeDeviceId(
    options: { audio?: string | null; video?: string | null } = {},
    startOptions?: Omit<
      StartUserMediaOptions,
      "audioConstraints" | "videoConstraints"
    >,
  ): MediaDevice {
    if (this.userMediaStream) {
      // NOTE: take into account only live tracks here
      const initAudioConstraints = this.userMediaStream
        .getAudioTracks()
        .filter(track => track.readyState === "live")[0]
        ?.getConstraints();

      const initVideoConstraints = this.userMediaStream
        .getVideoTracks()
        .filter(track => track.readyState === "live")[0]
        ?.getConstraints();

      const audioConstraints = _.cloneDeep(initAudioConstraints) || {};
      const videoConstraints = _.cloneDeep(initVideoConstraints) || {};

      if (options.audio) {
        audioConstraints.deviceId = {
          [options.audio === "default" ? "ideal" : "exact"]: options.audio,
        };
      }

      if (options.video) {
        videoConstraints.deviceId = {
          [options.video === "default" ? "ideal" : "exact"]: options.video,
        };
      }

      const hasMicChanged =
        (options.audio && !initAudioConstraints) ||
        getMediaTrackDeviceId(initAudioConstraints) !==
          getMediaTrackDeviceId(audioConstraints);

      const hasCameraChanged =
        (options.video && !initVideoConstraints) ||
        getMediaTrackDeviceId(initVideoConstraints) !==
          getMediaTrackDeviceId(videoConstraints);

      if (hasMicChanged || hasCameraChanged) {
        this.startUserMedia(
          {
            audio: hasMicChanged,
            video: hasCameraChanged,
          },
          { audioConstraints, videoConstraints, ...(startOptions || {}) },
        );
      }
    }

    return this;
  }

  stopScreenSharing(): MediaDevice {
    this.screenSharingStream?.getTracks().forEach(t => {
      t.stop();
    });

    this.screenSharingStream = null;
    this.emit(
      MediaDeviceEvents.SCREEN_SHARING_STREAM,
      this.screenSharingStream,
    );

    return this;
  }

  stop(): MediaDevice {
    this.stopScreenSharing();
    this.userMediaStream?.getTracks().forEach(track => {
      track.stop();
    });

    // do not notify about userMediaStream stop

    // detaching all event handlers
    this.off();
    return this;
  }
}

export default MediaDevice;
