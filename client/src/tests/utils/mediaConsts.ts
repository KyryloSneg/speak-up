export const mockMicrophones: MediaDeviceInfo[] = [
  {
    deviceId: "deviceId",
    groupId: "groupId",
    kind: "audioinput",
    label: "label",
    toJSON: () => {},
  },
  {
    deviceId: "anotherDeviceId",
    groupId: "anotherGroupId",
    kind: "audioinput",
    label: "anotherLabel",
    toJSON: () => {},
  },
] as const;

export const mockAudioOutputs: MediaDeviceInfo[] = [
  {
    deviceId: "outputDeviceId",
    groupId: "outputGroupId",
    kind: "audiooutput",
    label: "label",
    toJSON: () => {},
  },
] as const;

export const mockCameras: MediaDeviceInfo[] = [
  {
    deviceId: "deviceId",
    groupId: "groupId",
    kind: "videoinput",
    label: "label",
    toJSON: () => {},
  },
  {
    deviceId: "anotherDeviceId",
    groupId: "anotherGroupId",
    kind: "videoinput",
    label: "anotherLabel",
    toJSON: () => {},
  },
] as const;

export const mockDevices: MediaDeviceInfo[] = [
  ...mockMicrophones,
  ...mockAudioOutputs,
  ...mockCameras,
] as const;

export const mockUserMediaDevices: MediaDeviceInfo[] = [
  ...mockMicrophones,
  ...mockCameras,
] as const;
