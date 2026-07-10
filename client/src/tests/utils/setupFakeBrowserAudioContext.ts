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

export interface MockAudioContext {
  state: AudioContextState;
  createAnalyser: () => AnalyserNode;
  createMediaStreamSource: (stream: MediaStream) => MediaStreamAudioSourceNode;
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

export class FakeAudioContext implements MockAudioContext {
  public state: AudioContextState = "suspended";

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

  if (typeof window !== "undefined") {
    Object.defineProperty(globalThis, "webkitAudioContext", {
      value: AudioContextMock,
      writable: true,
      configurable: true,
    });
  }

  if (isToSetupMediaEngine && !globalThis.MediaStreamTrack) {
    setupFakeBrowserMediaEngine();
  }

  FakeAnalyserNode.volume = 0;

  const vitestVi = (globalThis as any).vi;
  if (vitestVi) vitestVi.clearAllMocks();
}

export default setupFakeBrowserAudioContext;
