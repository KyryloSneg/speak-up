import useRequestingFullScreen from "@/composables/useRequestingFullScreen";
import { useRoomStore } from "@/stores/room";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

const isFullscreenRef = ref(false);

const enterMock = vi.fn();
const exitMock = vi.fn();

vi.mock("@vueuse/core", () => ({
  useFullscreen: vi.fn(() => ({
    isFullscreen: isFullscreenRef,
    enter: enterMock,
    exit: exitMock,
  })),
}));

describe("useRequestingFullScreen", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    isFullscreenRef.value = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useRequestingFullScreen();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should call enter() when fullScreenItem becomes truthy", async () => {
    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.fullScreenItem = { userId: "user-1", type: "user" };
    await nextTick();

    expect(enterMock).toHaveBeenCalledTimes(1);
  });

  it("should call exit() when fullScreenItem becomes null if app was NOT fullscreen prior to request", async () => {
    isFullscreenRef.value = false;

    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.fullScreenItem = { userId: "user-1", type: "screenSharing" };
    await nextTick();

    expect(enterMock).toHaveBeenCalledTimes(1);

    roomStore.fullScreenItem = null;
    await nextTick();

    expect(exitMock).toHaveBeenCalledTimes(1);
  });

  it("should NOT call exit() when fullScreenItem becomes null if app WAS ALREADY fullscreen prior to request", async () => {
    isFullscreenRef.value = true;

    mountTestComponent();
    const roomStore = useRoomStore();

    roomStore.fullScreenItem = { userId: "user-1", type: "user" };
    await nextTick();

    expect(enterMock).toHaveBeenCalledTimes(1);

    roomStore.fullScreenItem = null;
    await nextTick();

    expect(exitMock).not.toHaveBeenCalled();
  });
});
