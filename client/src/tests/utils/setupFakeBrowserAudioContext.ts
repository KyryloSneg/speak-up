import safeMockFn from "@/tests/utils/safeMockFn";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";

export interface MockAnalyserNode {
  fftSize: number;
  readonly frequencyBinCount: number;

  getByteFrequencyData: (array: Uint8Array) => void;
  disconnect: () => void;
}

export interface MockMediaStreamAudioSourceNode {
  connect: () => void;
  disconnect: () => void;
}

export interface MockGainNode {
  gain: {
    value: number;
    setTargetAtTime: (
      target: number,
      startTime: number,
      timeConstant: number,
    ) => void;
  };
  connect: () => void;
  disconnect: () => void;
}

export interface MockBiquadFilterNode {
  type: string;
  frequency: { value: number };
  Q: { value: number };
  connect: () => void;
  disconnect: () => void;
}

export interface MockMediaStreamAudioDestinationNode {
  stream: MediaStream;
  connect: () => void;
  disconnect: () => void;
}

export interface MockAudioContext {
  state: AudioContextState;
  currentTime: number;
  createAnalyser: () => AnalyserNode;
  createMediaStreamSource: (stream: MediaStream) => MediaStreamAudioSourceNode;
  createGain: () => GainNode;
  createMediaStreamDestination: () => MediaStreamAudioDestinationNode;
  resume: () => Promise<void>;
  close: () => Promise<void>;
}

export class FakeAnalyserNode implements MockAnalyserNode {
  public fftSize = 256;
  public static volume = 0;

  get frequencyBinCount(): number {
    return this.fftSize / 2;
  }

  public getByteFrequencyData(_array: Uint8Array): void {}
  public disconnect(): void {}
}

FakeAnalyserNode.prototype.getByteFrequencyData = safeMockFn(
  (array: Uint8Array) => array.fill(FakeAnalyserNode.volume),
);

FakeAnalyserNode.prototype.disconnect = safeMockFn();

export class FakeMediaStreamAudioSourceNode implements MockMediaStreamAudioSourceNode {
  public stream: MediaStream;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  public connect(): void {}
  public disconnect(): void {}
}

FakeMediaStreamAudioSourceNode.prototype.connect = safeMockFn();
FakeMediaStreamAudioSourceNode.prototype.disconnect = safeMockFn();

const fakeGainNodeGain: MockGainNode["gain"] = {
  value: 1,
  setTargetAtTime: safeMockFn(),
};

export class FakeGainNode implements MockGainNode {
  public gain = fakeGainNodeGain;

  public connect(): void {}
  public disconnect(): void {}
}

FakeGainNode.prototype.gain = fakeGainNodeGain;
FakeGainNode.prototype.gain.setTargetAtTime = safeMockFn();
FakeGainNode.prototype.connect = safeMockFn();
FakeGainNode.prototype.disconnect = safeMockFn();

export class FakeBiquadFilterNode implements MockBiquadFilterNode {
  public type = "lowpass";
  public frequency = { value: 350 };
  public Q = { value: 1 };

  public connect(): void {}
  public disconnect(): void {}
}

FakeBiquadFilterNode.prototype.connect = safeMockFn();
FakeBiquadFilterNode.prototype.disconnect = safeMockFn();

export class FakeMediaStreamAudioDestinationNode implements MockMediaStreamAudioDestinationNode {
  public stream: MediaStream;

  constructor() {
    let audioTrack: MediaStreamTrack;
    if (globalThis.MediaStreamTrack) {
      audioTrack = new globalThis.MediaStreamTrack();
      (audioTrack as any).kind = "audio";
    } else {
      audioTrack = {} as MediaStreamTrack;
    }

    this.stream = globalThis.MediaStream
      ? new globalThis.MediaStream([audioTrack])
      : ({} as MediaStream);
  }

  public connect(): void {}
  public disconnect(): void {}
}

FakeMediaStreamAudioDestinationNode.prototype.connect = safeMockFn();
FakeMediaStreamAudioDestinationNode.prototype.disconnect = safeMockFn();

export class FakeAudioContext implements MockAudioContext {
  public static instances: FakeAudioContext[] = [];
  public state: AudioContextState = "suspended";
  public currentTime = 0;

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  public createAnalyser(): AnalyserNode {
    return new FakeAnalyserNode() as unknown as AnalyserNode;
  }

  public createMediaStreamSource(
    stream: MediaStream,
  ): MediaStreamAudioSourceNode {
    return new FakeMediaStreamAudioSourceNode(
      stream,
    ) as unknown as MediaStreamAudioSourceNode;
  }

  public createGain(): GainNode {
    return new FakeGainNode() as unknown as GainNode;
  }

  public createBiquadFilter(): BiquadFilterNode {
    return new FakeBiquadFilterNode() as unknown as BiquadFilterNode;
  }

  public createMediaStreamDestination(): MediaStreamAudioDestinationNode {
    return new FakeMediaStreamAudioDestinationNode() as unknown as MediaStreamAudioDestinationNode;
  }

  public async resume(): Promise<void> {}
  public async close(): Promise<void> {}
}

FakeAudioContext.prototype.createMediaStreamSource = safeMockFn(function (
  this: FakeAudioContext,
  stream,
) {
  return new FakeMediaStreamAudioSourceNode(
    stream,
  ) as unknown as MediaStreamAudioSourceNode;
});

FakeAudioContext.prototype.createGain = safeMockFn(function (
  this: FakeAudioContext,
) {
  return new FakeGainNode() as unknown as GainNode;
});

FakeAudioContext.prototype.createBiquadFilter = safeMockFn(function (
  this: FakeAudioContext,
) {
  return new FakeBiquadFilterNode() as unknown as BiquadFilterNode;
});

FakeAudioContext.prototype.createMediaStreamDestination = safeMockFn(function (
  this: FakeAudioContext,
) {
  return new FakeMediaStreamAudioDestinationNode() as unknown as MediaStreamAudioDestinationNode;
});

FakeAudioContext.prototype.resume = safeMockFn(async function (
  this: FakeAudioContext,
) {
  if (this.state === "suspended") this.state = "running";
});

FakeAudioContext.prototype.close = safeMockFn(async function (
  this: FakeAudioContext,
) {
  this.state = "closed";
});

function setupFakeBrowserAudioContext(
  isToSetupMediaEngine: boolean = true,
): void {
  if (isToSetupMediaEngine && !globalThis.MediaStreamTrack) {
    setupFakeBrowserMediaEngine();
  }

  const AudioContextMock = safeMockFn(function (
    this: unknown,
    ...args: unknown[]
  ) {
    return Reflect.construct(FakeAudioContext, args);
  });

  Object.getOwnPropertyNames(FakeAudioContext.prototype).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(
      FakeAudioContext.prototype,
      key,
    );

    if (descriptor) {
      Object.defineProperty(AudioContextMock.prototype, key, descriptor);
    }
  });

  Object.defineProperty(globalThis, "AudioContext", {
    value: AudioContextMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "AnalyserNode", {
    value: FakeAnalyserNode,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "MediaStreamAudioSourceNode", {
    value: FakeMediaStreamAudioSourceNode,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "GainNode", {
    value: FakeGainNode,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "BiquadFilterNode", {
    value: FakeBiquadFilterNode,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "MediaStreamAudioDestinationNode", {
    value: FakeMediaStreamAudioDestinationNode,
    writable: true,
    configurable: true,
  });

  if (typeof window !== "undefined") {
    Object.defineProperty(globalThis, "webkitAudioContext", {
      value: AudioContextMock,
      writable: true,
      configurable: true,
    });
  }

  FakeAnalyserNode.volume = 0;
  FakeAudioContext.instances = [];

  const vitestVi = (globalThis as any).vi;
  if (vitestVi) vitestVi.clearAllMocks();
}

export default setupFakeBrowserAudioContext;
