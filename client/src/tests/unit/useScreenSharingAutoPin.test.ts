import useScreenSharingAutoPin from "@/composables/useScreenSharingAutoPin";
import { useAuthStore } from "@/stores/auth";
import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import { useWebRTCStore, type RemoteStreams } from "@/stores/webrtc";
import type { UserDto } from "@speak-up/shared";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick, reactive } from "vue";

describe("useScreenSharingAutoPin", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useScreenSharingAutoPin();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should auto-pin local user when screen sharing starts and unpin when stopped", async () => {
    mountTestComponent();

    const authStore = useAuthStore();
    const mediaStore = useMediaStore();
    const roomStore = useRoomStore();

    authStore.user = { id: "local-user-123" } as unknown as UserDto;
    roomStore.pinnedItems = [];

    mediaStore.isSharingScreen = true;
    await nextTick();

    expect(roomStore.pinnedItems).toEqual([
      { userId: "local-user-123", type: "screenSharing" },
    ]);

    mediaStore.isSharingScreen = false;
    await nextTick();

    expect(roomStore.pinnedItems).toEqual([]);
  });

  it("should auto-pin remote user screen share when stream becomes active", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    roomStore.pinnedItems = [];

    const mockStream = { active: true } as MediaStream;
    const remoteStreamEntry: RemoteStreams = reactive({
      userMedia: null,
      screenSharing: mockStream,
    });

    webRTCStore.remoteStreams.set("remote-user-1", remoteStreamEntry);

    await nextTick();
    expect(roomStore.pinnedItems).toEqual([
      { userId: "remote-user-1", type: "screenSharing" },
    ]);
  });

  it("should auto-unpin remote user screen share when stream is no longer active", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    const mockStream = reactive({ active: true }) as unknown as MediaStream;
    const remoteStreamEntry: RemoteStreams = reactive({
      userMedia: null,
      screenSharing: mockStream,
    });

    webRTCStore.remoteStreams.set("remote-user-1", remoteStreamEntry);
    roomStore.pinnedItems = [
      { userId: "remote-user-1", type: "screenSharing" },
    ];
    await nextTick();

    (mockStream as any).active = false;
    await nextTick();

    expect(roomStore.pinnedItems).toEqual([]);
  });

  it("should preserve non-screenSharing pinned items when unpinning inactive screen shares", async () => {
    mountTestComponent();

    const authStore = useAuthStore();
    const mediaStore = useMediaStore();
    const roomStore = useRoomStore();

    authStore.user = { id: "local-user-123" } as unknown as UserDto;
    mediaStore.isSharingScreen = true;

    roomStore.pinnedItems = [
      { userId: "user-camera-1", type: "user" },
      { userId: "local-user-123", type: "screenSharing" },
    ];

    await nextTick();
    mediaStore.isSharingScreen = false;

    await nextTick();
    expect(roomStore.pinnedItems).toEqual([
      { userId: "user-camera-1", type: "user" },
    ]);
  });

  it("should not create duplicate pinned entries if screen share is already pinned", async () => {
    mountTestComponent();

    const authStore = useAuthStore();
    const mediaStore = useMediaStore();
    const roomStore = useRoomStore();

    authStore.user = { id: "local-user-123" } as unknown as UserDto;
    roomStore.pinnedItems = [
      { userId: "local-user-123", type: "screenSharing" },
    ];

    mediaStore.isSharingScreen = true;

    await nextTick();
    expect(roomStore.pinnedItems.length).toBe(1);
  });

  it("should safely execute without errors when roomStore.pinnedItems is null", async () => {
    mountTestComponent();
    const mediaStore = useMediaStore();
    const roomStore = useRoomStore();

    roomStore.pinnedItems = null;
    mediaStore.isSharingScreen = true;

    await nextTick();
    expect(roomStore.pinnedItems).toBeNull();
  });
});
