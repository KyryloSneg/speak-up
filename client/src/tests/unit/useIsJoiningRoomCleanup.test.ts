import useIsJoiningRoomCleanup from "@/composables/useIsJoiningRoomCleanup";
import { useRoomStore } from "@/stores/room";
import { ROOM_STATE_CLEANUP_DEBOUNCE_MS } from "@/utils/consts";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

describe("useIsJoiningRoomCleanup", () => {
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
        useIsJoiningRoomCleanup();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should reset roomStore.isJoining to false and roomIdUserIsTryingToJoin to null after debounce delay", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.isJoining = true;
    roomStore.roomIdUserIsTryingToJoin = "room-123";

    await nextTick();

    expect(roomStore.isJoining).toBe(true);
    expect(roomStore.roomIdUserIsTryingToJoin).toBe("room-123");

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS);

    expect(roomStore.isJoining).toBe(false);
    expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
  });

  it("should trigger cleanup debounce when roomIdUserIsTryingToJoin changes independently", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.roomIdUserIsTryingToJoin = "room-456";

    await nextTick();
    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS);

    expect(roomStore.isJoining).toBe(false);
    expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
  });

  it("should retain state before debounce delay completes", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.isJoining = true;
    roomStore.roomIdUserIsTryingToJoin = "room-789";

    await nextTick();
    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS - 1);

    expect(roomStore.isJoining).toBe(true);
    expect(roomStore.roomIdUserIsTryingToJoin).toBe("room-789");
  });

  it("should restart debounce timer if watched properties change repeatedly", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.isJoining = true;

    await nextTick();
    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);

    roomStore.roomIdUserIsTryingToJoin = "room-abc";

    await nextTick();
    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);

    expect(roomStore.isJoining).toBe(true);
    expect(roomStore.roomIdUserIsTryingToJoin).toBe("room-abc");

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS / 2);

    expect(roomStore.isJoining).toBe(false);
    expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
  });
});
