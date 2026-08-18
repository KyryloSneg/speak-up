function sortByMIMETypes(
  codecs: RTCRtpCodec[],
  preferredOrder: string[],
): RTCRtpCodec[] {
  return [...codecs].sort((a, b) => {
    const indexA = preferredOrder.indexOf(a.mimeType);
    const indexB = preferredOrder.indexOf(b.mimeType);

    const orderA = indexA >= 0 ? indexA : Infinity;
    const orderB = indexB >= 0 ? indexB : Infinity;

    return orderA - orderB;
  });
}

export default sortByMIMETypes;
