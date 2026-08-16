import useSendingWebRTCUserMedia from "@/composables/useSendingWebRTCUserMedia";
import { useMediaStore } from "@/stores/media";
import { useWebRTCStore } from "@/stores/webrtc";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

describe("useSendingWebRTCUserMedia", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useSendingWebRTCUserMedia();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should NOT call webRTCStore.sendUserMedia if userMediaStream is null or undefined", () => {
    const mediaStore = useMediaStore();
    const webRTCStore = useWebRTCStore();
    const sendUserMediaSpy = vi.spyOn(webRTCStore, "sendUserMedia");

    mediaStore.userMediaStream = null;
    mountTestComponent();

    expect(sendUserMediaSpy).not.toHaveBeenCalled();
  });

  it("should call webRTCStore.sendUserMedia with the stream when userMediaStream is set", async () => {
    const mediaStore = useMediaStore();
    const webRTCStore = useWebRTCStore();
    const sendUserMediaSpy = vi.spyOn(webRTCStore, "sendUserMedia");

    const mockStream = { id: "stream-1" } as unknown as MediaStream;

    mountTestComponent();

    mediaStore.userMediaStream = mockStream;
    await nextTick();

    expect(sendUserMediaSpy).toHaveBeenCalledTimes(1);
    expect(sendUserMediaSpy).toHaveBeenCalledWith(mockStream);
  });

  it("should call webRTCStore.sendUserMedia again when userMediaStream changes to a new stream", async () => {
    const mediaStore = useMediaStore();
    const webRTCStore = useWebRTCStore();
    const sendUserMediaSpy = vi.spyOn(webRTCStore, "sendUserMedia");

    const mockStream1 = { id: "stream-1" } as unknown as MediaStream;
    const mockStream2 = { id: "stream-2" } as unknown as MediaStream;

    mediaStore.userMediaStream = mockStream1;
    mountTestComponent();

    expect(sendUserMediaSpy).toHaveBeenCalledTimes(1);
    expect(sendUserMediaSpy).toHaveBeenCalledWith(mockStream1);

    mediaStore.userMediaStream = mockStream2;
    await nextTick();

    expect(sendUserMediaSpy).toHaveBeenCalledTimes(2);
    expect(sendUserMediaSpy).toHaveBeenCalledWith(mockStream2);
  });

  it("should not call sendUserMedia when userMediaStream transitions back to null", async () => {
    const mediaStore = useMediaStore();
    const webRTCStore = useWebRTCStore();
    const sendUserMediaSpy = vi.spyOn(webRTCStore, "sendUserMedia");

    const mockStream = { id: "stream-1" } as unknown as MediaStream;
    mediaStore.userMediaStream = mockStream;

    mountTestComponent();
    expect(sendUserMediaSpy).toHaveBeenCalledTimes(1);

    mediaStore.userMediaStream = null;
    await nextTick();

    expect(sendUserMediaSpy).toHaveBeenCalledTimes(1);
  });
});
