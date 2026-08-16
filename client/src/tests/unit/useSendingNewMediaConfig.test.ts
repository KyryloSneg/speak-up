import useSendingNewMediaConfig from "@/composables/useSendingNewMediaConfig";
import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import type { Room } from "@/types/room";
import type { UserDto } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useSendingNewMediaConfig", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should send the new media config to other users if there are any users to receive it", async () => {
    const mediaStore = useMediaStore();
    const roomStore = useRoomStore();

    const sendMediaConfigSpy = vi.spyOn(mediaStore, "sendMediaConfig");

    useSendingNewMediaConfig();
    await nextTick();

    const room = {
      id: "id",
      users: [
        { id: "id" } as unknown as UserDto,
        { id: "anotherId" } as unknown as UserDto,
      ],
      messages: [],
    } as unknown as Room;

    roomStore.room = room;
    await nextTick();

    expect(sendMediaConfigSpy).toHaveBeenCalledOnce();
  });

  it("should not send the new media config if there are not enough receivers of it", async () => {
    const mediaStore = useMediaStore();
    const roomStore = useRoomStore();

    const sendMediaConfigSpy = vi.spyOn(mediaStore, "sendMediaConfig");

    useSendingNewMediaConfig();
    await nextTick();

    expect(sendMediaConfigSpy).not.toHaveBeenCalled();
    const room = {
      id: "id",
      users: [{ id: "id" } as unknown as UserDto],
      messages: [],
    } as unknown as Room;

    roomStore.room = room;

    await nextTick();

    expect(sendMediaConfigSpy).not.toHaveBeenCalled();
    expect(sendMediaConfigSpy).not.toHaveBeenCalled();
  });
});
