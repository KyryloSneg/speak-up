import useMaxMembersOfFutureRoomCleanup from "@/composables/useMaxMembersOfFutureRoomCleanup";
import { useRoomStore } from "@/stores/room";
import { ROOM_STATE_CLEANUP_DEBOUNCE_MS } from "@/utils/consts";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

describe("useMaxMembersOfFutureRoomCleanup", () => {
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
        useMaxMembersOfFutureRoomCleanup();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should reset roomStore.maxMembersOfFutureRoom to null after debounce delay", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.maxMembersOfFutureRoom = 8;
    await nextTick();

    expect(roomStore.maxMembersOfFutureRoom).toBe(8);

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS);
    expect(roomStore.maxMembersOfFutureRoom).toBeNull();
  });

  it("should retain maxMembersOfFutureRoom value before debounce delay completes", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.maxMembersOfFutureRoom = 4;
    await nextTick();

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS - 1);

    expect(roomStore.maxMembersOfFutureRoom).toBe(4);
  });

  it("should restart debounce timer when maxMembersOfFutureRoom changes repeatedly", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.maxMembersOfFutureRoom = 6;
    await nextTick();

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);

    roomStore.maxMembersOfFutureRoom = 12;
    await nextTick();

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);
    expect(roomStore.maxMembersOfFutureRoom).toBe(12);

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);
    expect(roomStore.maxMembersOfFutureRoom).toBeNull();
  });
});
