import useUserIdsToRemoveCleanup from "@/composables/useUserIdsToRemoveCleanup";
import { useHostStore } from "@/stores/host";
import { useRoomStore } from "@/stores/room";
import type { Room } from "@/types/room";
import { ROOM_STATE_CLEANUP_DEBOUNCE_MS } from "@/utils/consts";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

describe("useUserIdsToRemoveCleanup", () => {
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
        useUserIdsToRemoveCleanup();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should immediately clean up userIdsToRemove when room.id changes", async () => {
    mountTestComponent();

    const hostStore = useHostStore();
    const roomStore = useRoomStore();

    hostStore.userIdsToRemove = ["user-1", "user-2"];
    roomStore.room = { id: "room-123" } as unknown as Room;

    await nextTick();
    expect(hostStore.userIdsToRemove).toEqual([]);
  });

  it("should clean up userIdsToRemove after debounce delay when userIdsToRemove becomes non-empty", async () => {
    mountTestComponent();
    const hostStore = useHostStore();

    hostStore.userIdsToRemove = ["user-1"];
    await nextTick();

    expect(hostStore.userIdsToRemove).toEqual(["user-1"]);

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS);
    await nextTick();

    expect(hostStore.userIdsToRemove).toEqual([]);
  });

  it("should NOT trigger debounced cleanup when userIdsToRemove is set to an empty array", async () => {
    mountTestComponent();
    const hostStore = useHostStore();

    hostStore.userIdsToRemove = [];
    await nextTick();

    vi.advanceTimersByTime(ROOM_STATE_CLEANUP_DEBOUNCE_MS);
    await nextTick();

    expect(hostStore.userIdsToRemove).toEqual([]);
  });
});
