import {
  mockCameras,
  mockDevices,
  mockMicrophones,
} from "@/tests/utils/mediaConsts";
import safeMockFn from "@/tests/utils/safeMockFn";
import { FacingModes } from "@/types/media";

export class FakePermissionsManager {
  private states: Record<string, PermissionState> = {};
  private defaultState: PermissionState = "granted";

  public set(
    name: "microphone" | "camera" | string,
    state: PermissionState,
  ): void {
    this.states[name] = state;
  }

  public get(name: string): PermissionState {
    return this.states[name] || this.defaultState;
  }

  public reset(initialDefault: PermissionState = "granted"): void {
    this.states = {};
    this.defaultState = initialDefault;
  }
}

function setupFakeBrowserMediaEngine(
  initialPermissionsDefault: PermissionState = "granted",
): { permissionsManager: FakePermissionsManager } {
  const permissionsManager = new FakePermissionsManager();
  permissionsManager.reset(initialPermissionsDefault);

  class FakeMediaStreamTrack {
    public enabled: boolean;
    public readyState: "live" | "ended";
    public kind: "audio" | "video";
    public id: string;
    private constraints: MediaTrackConstraints = {};

    constructor(
      kind: "audio" | "video",
      incomingConstraints: MediaTrackConstraints = {},
    ) {
      this.enabled = true;
      this.readyState = "live";
      this.kind = kind;
      this.id = `${this.kind}-${Math.random()}`;

      this.constraints = incomingConstraints;

      if (!this.constraints.deviceId) {
        this.constraints.deviceId = { exact: "deviceId" };
      }
    }

    stop() {
      this.readyState = "ended";
    }

    getConstraints() {
      return this.constraints;
    }

    getSettings() {
      type ObjectFacingMode = { exact?: string } & { ideal?: string };

      const facingMode =
        (this.constraints.facingMode as unknown as ObjectFacingMode)?.exact ||
        (this.constraints.facingMode as unknown as ObjectFacingMode)?.ideal ||
        this.constraints.facingMode ||
        FacingModes.USER;

      return { facingMode };
    }

    applyConstraints(newConstraints: MediaTrackConstraints) {
      this.constraints = { ...this.constraints, ...newConstraints };
      return Promise.resolve();
    }
  }

  class FakeMediaStream {
    public id: string;
    public tracks: FakeMediaStreamTrack[];

    constructor(tracks: FakeMediaStreamTrack[]) {
      this.id = `stream-${Math.random()}`;
      this.tracks = tracks;
    }

    getTracks() {
      return this.tracks;
    }

    getAudioTracks() {
      return this.tracks.filter(track => track.kind === "audio");
    }

    getVideoTracks() {
      return this.tracks.filter(track => track.kind === "video");
    }

    addTrack(track: FakeMediaStreamTrack) {
      this.tracks.push(track);
    }

    removeTrack(track: FakeMediaStreamTrack) {
      this.tracks = this.tracks.filter(item => item.id !== track.id);
    }
  }

  const mockMediaDevices = Object.assign(new EventTarget(), {
    getUserMedia: safeMockFn(async (config: MediaStreamConstraints) => {
      if (config.audio && permissionsManager.get("microphone") === "denied") {
        throw new DOMException(
          "Microphone permission denied",
          "NotAllowedError",
        );
      }

      if (config.video && permissionsManager.get("camera") === "denied") {
        throw new DOMException("Camera permission denied", "NotAllowedError");
      }

      const tracks: FakeMediaStreamTrack[] = [];

      if (config.audio) {
        const audioConstraints =
          typeof config.audio === "boolean" ? {} : config.audio;

        tracks.push(new FakeMediaStreamTrack("audio", audioConstraints));
      }

      if (config.video) {
        const videoConstraints =
          typeof config.video === "boolean" ? {} : config.video;

        tracks.push(new FakeMediaStreamTrack("video", videoConstraints));
      }

      return new FakeMediaStream(tracks);
    }),
    enumerateDevices: safeMockFn(async () => {
      const micGranted = permissionsManager.get("microphone") === "granted";
      const camGranted = permissionsManager.get("camera") === "granted";

      if (micGranted && camGranted) return mockDevices;
      if (micGranted) return mockMicrophones;
      if (camGranted) return mockCameras;
    }),
  });

  const mockPermissions = {
    query: safeMockFn(async descriptor => ({
      state: permissionsManager.get(descriptor.name),
      name: descriptor.name,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  };

  const vitestVi = (globalThis as any).vi;

  // e2e (unused): target navigator prototype to bypass non-configurable restrictions
  const navigatorTarget = globalThis.navigator
    ? vitestVi
      ? globalThis.navigator
      : Object.getPrototypeOf(globalThis.navigator)
    : null;

  Object.defineProperty(navigatorTarget, "mediaDevices", {
    value: mockMediaDevices,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(navigatorTarget, "permissions", {
    value: mockPermissions,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "MediaStream", {
    value: FakeMediaStream,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "MediaStreamTrack", {
    value: FakeMediaStreamTrack,
    writable: true,
    configurable: true,
  });

  if (vitestVi) vitestVi.clearAllMocks();

  return { permissionsManager };
}

export default setupFakeBrowserMediaEngine;
