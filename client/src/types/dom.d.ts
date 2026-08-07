export {};

declare global {
  interface DisplayMediaStreamOptions {
    selfBrowserSurface?: "include" | "exclude";
    surfaceSwitching?: "include" | "exclude";
    systemAudio?: "include" | "exclude";
    monitorTypeSurfaces?: "include" | "exclude";
    suppressLocalAudioPlayback?: "include" | "exclude" | "supress";
    preferCurrentTab?: boolean;
  }

  interface MediaTrackConstraints {
    latency?: ConstrainDouble;
    googHighpassFilter?: boolean;
    googAudioMirroring?: boolean;
  }
}
