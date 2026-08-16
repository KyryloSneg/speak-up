import useSyncSharingScreenAnnouncerText from "@/composables/useSyncSharingScreenAnnouncerText";
import { useRoomStore } from "@/stores/room";
import { useWebRTCStore } from "@/stores/webrtc";
import type { Room } from "@/types/room";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick, reactive } from "vue";

describe("useSyncSharingScreenAnnouncerText", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useSyncSharingScreenAnnouncerText();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should set announcer text when a user starts screen sharing", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    roomStore.room = {
      users: [{ id: "user-1", nickname: "Alice" }],
    } as unknown as Room;

    const remoteStreamsMap = reactive(new Map());
    webRTCStore.remoteStreams = remoteStreamsMap as any;

    remoteStreamsMap.set("user-1", {
      screenSharing: { active: true },
    });

    await nextTick();
    expect(webRTCStore.sharingScreenAnnouncerText).toBe(
      'User "Alice" shares their screen',
    );
  });

  it("should identify and announce the newly added user when multiple users share screens", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    roomStore.room = {
      users: [
        { id: "user-1", nickname: "Alice" },
        { id: "user-2", nickname: "Bob" },
      ],
    } as unknown as Room;

    const remoteStreamsMap = reactive(new Map());
    webRTCStore.remoteStreams = remoteStreamsMap as any;

    remoteStreamsMap.set("user-1", { screenSharing: { active: true } });
    await nextTick();

    expect(webRTCStore.sharingScreenAnnouncerText).toBe(
      'User "Alice" shares their screen',
    );

    remoteStreamsMap.set("user-2", { screenSharing: { active: true } });
    await nextTick();

    expect(webRTCStore.sharingScreenAnnouncerText).toBe(
      'User "Bob" shares their screen',
    );
  });

  it("should NOT update announcer text when a user stops screen sharing", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    roomStore.room = {
      users: [{ id: "user-1", nickname: "Alice" }],
    } as unknown as Room;

    const remoteStreamsMap = reactive(new Map());
    webRTCStore.remoteStreams = remoteStreamsMap as any;

    remoteStreamsMap.set("user-1", { screenSharing: { active: true } });
    await nextTick();

    expect(webRTCStore.sharingScreenAnnouncerText).toBe(
      'User "Alice" shares their screen',
    );

    remoteStreamsMap.set("user-1", { screenSharing: { active: false } });
    await nextTick();

    expect(webRTCStore.sharingScreenAnnouncerText).toBe(
      'User "Alice" shares their screen',
    );
  });

  it("should NOT update announcer text if the user is not found in the room store", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    roomStore.room = {
      users: [{ id: "user-1", nickname: "Alice" }],
    } as unknown as Room;

    const remoteStreamsMap = reactive(new Map());
    webRTCStore.remoteStreams = remoteStreamsMap as any;
    webRTCStore.sharingScreenAnnouncerText = "";

    remoteStreamsMap.set("user-unknown", { screenSharing: { active: true } });
    await nextTick();

    expect(webRTCStore.sharingScreenAnnouncerText).toBe("");
  });

  it("should NOT update announcer text if room is null", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    roomStore.room = null;

    const remoteStreamsMap = reactive(new Map());
    webRTCStore.remoteStreams = remoteStreamsMap as any;
    webRTCStore.sharingScreenAnnouncerText = "";

    remoteStreamsMap.set("user-1", { screenSharing: { active: true } });
    await nextTick();

    expect(webRTCStore.sharingScreenAnnouncerText).toBe("");
  });

  it("should ignore remote streams without active screen sharing", async () => {
    mountTestComponent();

    const roomStore = useRoomStore();
    const webRTCStore = useWebRTCStore();

    roomStore.room = {
      users: [{ id: "user-1", nickname: "Alice" }],
    } as unknown as Room;

    const remoteStreamsMap = reactive(new Map());
    webRTCStore.remoteStreams = remoteStreamsMap as any;
    webRTCStore.sharingScreenAnnouncerText = "";

    remoteStreamsMap.set("user-1", { screenSharing: { active: false } });
    await nextTick();

    expect(webRTCStore.sharingScreenAnnouncerText).toBe("");
  });
});
