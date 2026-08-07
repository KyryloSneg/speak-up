function optimizeAudioSdp(sdp: string): string {
  const opusMatch = sdp.match(/a=rtpmap:(\d+)\s+opus\/48000\/2/i);
  if (!opusMatch) return sdp;

  const payloadType = opusMatch[1];
  const targetParams = [
    "maxaveragebitrate=128000",
    "usedtx=0",
    "useinbandfec=1",
    "cbr=1",
    "sprop-maxcapturerate=48000",
    "maxplaybackrate=48000",
  ] as const;

  const fmtpRegex = new RegExp(`a=fmtp:${payloadType}\\s+(.*)`);
  const fmtpMatch = sdp.match(fmtpRegex);

  if (fmtpMatch) {
    let currentParams = fmtpMatch[1];
    targetParams.forEach(param => {
      const [key] = param.split("=");

      if (currentParams) {
        if (!currentParams.includes(`${key}=`)) {
          currentParams += `;${param}`;
        }
      }
    });

    return sdp.replace(fmtpRegex, `a=fmtp:${payloadType} ${currentParams}`);
  }

  const rtpmapLine = opusMatch[0];
  const newFmtpLine = `${rtpmapLine}\r\na=fmtp:${payloadType} ${targetParams.join(";")}`;

  return sdp.replace(rtpmapLine, newFmtpLine);
}

export default optimizeAudioSdp;
