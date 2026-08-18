import useRoomBeforeUnload from "@/composables/useRoomBeforeUnload";
import { useRoomStore } from "@/stores/room";
import type { Room } from "@/types/room";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

describe("useRoomBeforeUnload", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useRoomBeforeUnload();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should call preventDefault on beforeunload when room exists in roomStore", async () => {
    const wrapper = mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.room = { id: "test-room-id" } as unknown as Room;
    await nextTick();

    const event = new Event("beforeunload", { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it("should NOT call preventDefault when roomStore.room is null", async () => {
    const wrapper = mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.room = null;
    await nextTick();

    const event = new Event("beforeunload", { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it("should remove window event listener when component is unmounted", async () => {
    const wrapper = mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.room = { id: "test-room-id" } as unknown as Room;

    await nextTick();
    wrapper.unmount();

    const event = new Event("beforeunload", { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
