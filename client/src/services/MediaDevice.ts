import Emitter from "@/services/Emitter";
import { FacingModes, type FacingMode } from "@/types/media";
import {
  MediaDeviceEvents,
  type MediaDeviceEventNames,
} from "@/types/mediaDeviceEvents";
import {
  DEFAULT_AUDIO_CONSTRAINTS,
  DEFAULT_VIDEO_CONSTRAINTS,
} from "@/utils/consts";
import getMediaTrackDeviceId from "@/utils/getMediaTrackDeviceId";
import inverseFacingMode from "@/utils/inverseFacingMode";
import _ from "lodash";

export type StartUserMediaOnError = (info: {
  error: Error | null;
  message: string;
}) => void;

export interface StartUserMediaOptions {
  audioConstraints?: MediaTrackConstraints;
  videoConstraints?: MediaTrackConstraints;
  onError?: StartUserMediaOnError;
}

export const defaultStartUserMediaOptions: StartUserMediaOptions = {
  audioConstraints: DEFAULT_AUDIO_CONSTRAINTS,
  videoConstraints: DEFAULT_VIDEO_CONSTRAINTS,
} as const;

class MediaDevice extends Emitter<MediaDeviceEventNames> {
  protected userMediaStream: MediaStream | null;
  protected prevUserMediaStreamId: string | null;
  protected latestMediaStreamId: string | null;

  constructor() {
    super();

    this.userMediaStream = null;
    this.prevUserMediaStreamId = null;
    this.latestMediaStreamId = null;
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

      const onStream: (stream: MediaStream) => void = stream => {
        // if we have already created a media stream, replace its TRACKS with new ones,
        // not the STREAM itself (because otherwise there will be no video and audio for a moment)
        if (this.userMediaStream) {
          this.prevUserMediaStreamId = this.latestMediaStreamId;

          const oldTracks = [...this.userMediaStream.getTracks()];
          const newTracks = stream.getTracks();

          newTracks.forEach(track => this.userMediaStream?.addTrack(track));
          const newKinds = new Set(newTracks.map(track => track?.kind));

          oldTracks.forEach(track => {
            if (newKinds.has(track?.kind)) {
              track.stop();
              this.userMediaStream?.removeTrack(track);
            }
          });
        } else {
          this.userMediaStream = stream;
        }

        this.latestMediaStreamId = stream.id;
        this.emit(MediaDeviceEvents.USER_MEDIA_STREAM, this.userMediaStream);
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
                this.userMediaStream?.removeTrack(track);
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
                this.userMediaStream?.removeTrack(track);
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
        } else if (error.name == "NotAllowedError") {
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

  toggleUserMedia(
    type: "audio" | "video",
    value: boolean | null = null,
  ): MediaDevice {
    if (this.userMediaStream) {
      function trackCb(track: MediaStreamTrack): void {
        track.enabled = typeof value === "boolean" ? value : !track.enabled;
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
    onError?: StartUserMediaOnError,
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
          { audioConstraints, videoConstraints, onError },
        );
      }
    }

    return this;
  }

  stop(): MediaDevice {
    this.userMediaStream?.getTracks().forEach(track => {
      track.stop();
    });

    // detaching all event handlers
    this.off();
    return this;
  }
}

export default MediaDevice;
