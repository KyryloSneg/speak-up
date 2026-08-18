type ChangeVolume = (volume: number) => void;

function getMediaStreamWithControlledVolume(
  initMediaStream: MediaStream,
  initVolume?: number,
): {
  mediaStream: MediaStream;
  ctx: AudioContext | null;
  gainNode: GainNode | null;
  changeVolume: ChangeVolume | null;
} {
  const audioTracks = initMediaStream.getAudioTracks();
  if (!audioTracks.length) {
    return {
      mediaStream: initMediaStream,
      ctx: null,
      gainNode: null,
      changeVolume: null,
    };
  }

  const ctx = new (AudioContext || (window as any).webkitAudioContext)();
  const source = ctx.createMediaStreamSource(initMediaStream);
  const gainNode = ctx.createGain();

  const destination = ctx.createMediaStreamDestination();
  const changeVolume: ChangeVolume = volume => {
    gainNode.gain.value = volume;
  };

  changeVolume(initVolume || 1);

  source.connect(gainNode);
  gainNode.connect(destination);

  const mediaStream = new MediaStream();

  initMediaStream
    .getVideoTracks()
    .forEach(track => mediaStream.addTrack(track));

  destination.stream
    .getAudioTracks()
    .forEach(track => mediaStream.addTrack(track));

  return { mediaStream, ctx, gainNode, changeVolume };
}

export default getMediaStreamWithControlledVolume;
