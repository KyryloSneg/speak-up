function optimizeAudioSdp(sdp: string): string {
  const opusMatch = sdp.match(/a=rtpmap:(\d+)\s+opus\/48000\/2/i);
  if (!opusMatch) return sdp;

  const payloadType = opusMatch[1];
  const targetParams: Record<string, string> = {
    maxaveragebitrate: "192000",
    stereo: "1",
    "sprop-stereo": "1",
    usedtx: "0",
    useinbandfec: "1",
    cbr: "0",
    "sprop-maxcapturerate": "48000",
    maxplaybackrate: "48000",
  } as const;

  const fmtpRegex = new RegExp(`a=fmtp:${payloadType}\\s+(.*)`);
  const fmtpMatch = sdp.match(fmtpRegex);
  const existingParams: Record<string, string> = {};

  fmtpMatch?.[1]?.split(";").forEach(pair => {
    const [key, val] = pair.trim().split("=");
    if (key) existingParams[key] = val || "";
  });

  const mergedParams = { ...existingParams, ...targetParams };
  const fmtpString = Object.entries(mergedParams)
    .map(([k, v]) => (v ? `${k}=${v}` : k))
    .join(";");

  const newFmtpLine = `a=fmtp:${payloadType} ${fmtpString}`;

  return fmtpMatch
    ? sdp.replace(fmtpRegex, newFmtpLine)
    : sdp.replace(opusMatch[0], `${opusMatch[0]}\r\na=${newFmtpLine}`);
}

export default optimizeAudioSdp;
