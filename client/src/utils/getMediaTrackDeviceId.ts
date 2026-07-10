function getMediaTrackDeviceId(constraints?: MediaTrackConstraints): string {
  // assume that this fn is called only if the track does exist
  if (!constraints) return "default";
  const currentDeviceIdValue = constraints.deviceId;

  let configDeviceId: string;
  if (typeof currentDeviceIdValue === "string") {
    configDeviceId = currentDeviceIdValue;
  } else {
    const currentDeviceIdValueObject = currentDeviceIdValue as unknown as
      | undefined
      | {
          ideal?: string;
          exact?: string;
        };

    configDeviceId =
      currentDeviceIdValueObject?.exact ||
      currentDeviceIdValueObject?.ideal ||
      "default";
  }

  return configDeviceId;
}

export default getMediaTrackDeviceId;
