import useRemoteScreenSharingsAutoCleanup from "@/composables/useRemoteScreenSharingsAutoCleanup";
import { useWebRTCStore, type RemoteStreams } from "@/stores/webrtc";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defineComponent,
  markRaw,
  nextTick,
  reactive,
  ref,
  type Ref,
} from "vue";

const mockActiveStateMap = new Map<MediaStream, Ref<boolean>>();

vi.mock("@/composables/useIsVideoActive", () => ({
  default: vi.fn((stream: MediaStream) => {
    if (!mockActiveStateMap.has(stream)) {
      mockActiveStateMap.set(stream, ref(true));
    }

    return mockActiveStateMap.get(stream)!;
  }),
}));

describe("useRemoteScreenSharingsAutoCleanup", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    mockActiveStateMap.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useRemoteScreenSharingsAutoCleanup();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  function createMockStream(
    tracks: Array<{ readyState: "live" | "ended" }> = [{ readyState: "live" }],
  ): MediaStream {
    return markRaw({
      getVideoTracks: () => tracks as MediaStreamTrack[],
    } as unknown as MediaStream);
  }

  it("should retain screenSharing when the stream video track is active", async () => {
    mountTestComponent();
    const webRTCStore = useWebRTCStore();

    const stream = createMockStream([{ readyState: "live" }]);
    const remoteStreamEntry: RemoteStreams = reactive({
      userMedia: null,
      screenSharing: stream,
    });

    webRTCStore.remoteStreams.set("user-1", remoteStreamEntry);

    await nextTick();
    vi.advanceTimersByTime(3000);

    expect(remoteStreamEntry.screenSharing).toBe(stream);
  });

  it("should immediately clean up screenSharing if stream has no video tracks or tracks are ended", async () => {
    mountTestComponent();
    const webRTCStore = useWebRTCStore();

    const endedStream = createMockStream([{ readyState: "ended" }]);
    const remoteStreamEntry: RemoteStreams = reactive({
      userMedia: null,
      screenSharing: endedStream,
    });

    const activeRef = ref(false);
    mockActiveStateMap.set(endedStream, activeRef);

    webRTCStore.remoteStreams.set("user-2", remoteStreamEntry);
    await nextTick();

    expect(remoteStreamEntry.screenSharing).toBeNull();
  });

  it("should delay cleanup by 2500ms when stream is inactive but tracks are not ended", async () => {
    mountTestComponent();
    const webRTCStore = useWebRTCStore();

    const inactiveStream = createMockStream([{ readyState: "live" }]);
    const remoteStreamEntry: RemoteStreams = reactive({
      userMedia: null,
      screenSharing: inactiveStream,
    });

    const activeRef = ref(false);
    mockActiveStateMap.set(inactiveStream, activeRef);

    webRTCStore.remoteStreams.set("user-3", remoteStreamEntry);
    await nextTick();

    vi.advanceTimersByTime(2400);
    expect(remoteStreamEntry.screenSharing).toBe(inactiveStream);

    vi.advanceTimersByTime(100);
    expect(remoteStreamEntry.screenSharing).toBeNull();
  });

  it("should cancel 2500ms cleanup timeout if stream becomes active again", async () => {
    mountTestComponent();
    const webRTCStore = useWebRTCStore();

    const stream = createMockStream([{ readyState: "live" }]);
    const remoteStreamEntry: RemoteStreams = reactive({
      userMedia: null,
      screenSharing: stream,
    });

    const activeRef = ref(false);
    mockActiveStateMap.set(stream, activeRef);

    webRTCStore.remoteStreams.set("user-4", remoteStreamEntry);

    await nextTick();
    vi.advanceTimersByTime(1500);

    activeRef.value = true;

    await nextTick();
    vi.advanceTimersByTime(2000);

    expect(remoteStreamEntry.screenSharing).toBe(stream);
  });

  it("should stop effect scope when a stream is removed from store", async () => {
    mountTestComponent();
    const webRTCStore = useWebRTCStore();

    const stream = createMockStream([{ readyState: "live" }]);
    const remoteStreamEntry: RemoteStreams = reactive({
      userMedia: null,
      screenSharing: stream,
    });

    webRTCStore.remoteStreams.set("user-5", remoteStreamEntry);

    await nextTick();
    const activeRef = mockActiveStateMap.get(stream)!;

    webRTCStore.remoteStreams.delete("user-5");

    await nextTick();

    activeRef.value = false;

    await nextTick();
    vi.advanceTimersByTime(3000);

    expect(webRTCStore.remoteStreams.has("user-5")).toBe(false);
  });
});
