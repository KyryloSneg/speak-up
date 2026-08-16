import useInitSentMediaConfigCleanup from "@/composables/useInitSentMediaConfigCleanup";
import { useRoomStore } from "@/stores/room";
import { ROOM_STATE_CLEANUP_DEBOUNCE_MS } from "@/utils/consts";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

describe("useInitSentMediaConfigCleanup", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useInitSentMediaConfigCleanup();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should reset roomStore.initSentMediaConfig to null after debounce delay", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    const mockConfig = { audio: false, video: true };
    roomStore.initSentMediaConfig = mockConfig;

    await nextTick();
    expect(roomStore.initSentMediaConfig).toEqual(mockConfig);

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS);
    expect(roomStore.initSentMediaConfig).toBeNull();
  });

  it("should retain initSentMediaConfig value before debounce delay completes", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    const mockConfig = { video: true, audio: true };
    roomStore.initSentMediaConfig = mockConfig;

    await nextTick();

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS - 1);
    expect(roomStore.initSentMediaConfig).toEqual(mockConfig);
  });

  it("should restart debounce timer when initSentMediaConfig changes repeatedly", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.initSentMediaConfig = { audio: false, video: true };

    await nextTick();
    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);

    const updatedConfig = { audio: true, video: false };
    roomStore.initSentMediaConfig = updatedConfig;

    await nextTick();

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);
    expect(roomStore.initSentMediaConfig).toEqual(updatedConfig);

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);
    expect(roomStore.initSentMediaConfig).toBeNull();
  });
});
