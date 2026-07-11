import useRoomUserSynchronization from "@/composables/useRoomUserSynchronization";
import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import { mockUser } from "@/tests/utils/consts";
import type { Room } from "@/types/room";
import * as updateUserModule from "@/utils/updateUser";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, type EffectScope } from "vue";

describe("useRoomUserSynchronization", () => {
  let scope: EffectScope;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();

    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
  });

  it("should properly sync user data inside room.users field", async () => {
    const updateUserSpy = vi.spyOn(updateUserModule, "default");

    scope.run(() => {
      useRoomUserSynchronization();
    });

    await nextTick();
    expect(updateUserSpy).not.toHaveBeenCalled();

    const authStore = useAuthStore();
    const roomStore = useRoomStore();

    const room = {
      id: "id",
      users: [
        mockUser,
        { id: `${mockUser.id}_another`, nickname: "anotherNickname" },
      ],
    } as unknown as Room;

    authStore.user = mockUser;
    roomStore.room = room;

    await nextTick();
    expect(updateUserSpy).toHaveBeenCalledOnce();

    expect(roomStore.room.users[0]).toStrictEqual(authStore.user);
    expect(roomStore.room.users[1]).toStrictEqual(room.users[1]);

    const newNickname = `${authStore.user.nickname} 123`;
    authStore.user.nickname = newNickname;

    await nextTick();
    expect(updateUserSpy).toHaveBeenCalledTimes(2);

    expect(roomStore.room.users[0]).toStrictEqual(authStore.user);
    expect(roomStore.room.users[1]).toStrictEqual(room.users[1]);
  });

  describe("ignore", () => {
    it("should ignore synchronization effect if user isn't authenticated", async () => {
      const updateUserSpy = vi.spyOn(updateUserModule, "default");

      scope.run(() => {
        useRoomUserSynchronization();
      });

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();

      const roomStore = useRoomStore();
      roomStore.room = { id: "id" } as unknown as Room;

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();
    });

    it("should ignore synchronization effect if user isn't in any room", async () => {
      const updateUserSpy = vi.spyOn(updateUserModule, "default");

      scope.run(() => {
        useRoomUserSynchronization();
      });

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();

      const authStore = useAuthStore();
      authStore.user = mockUser;

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();

      authStore.user.nickname = `${authStore.user.nickname} 123`;

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();
    });

    it("should ignore synchronization effect if user isn't in the current room (impossible)", async () => {
      const updateUserSpy = vi.spyOn(updateUserModule, "default");

      scope.run(() => {
        useRoomUserSynchronization();
      });

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();

      const authStore = useAuthStore();
      const roomStore = useRoomStore();

      authStore.user = mockUser;
      roomStore.room = {
        id: "id",
        users: [{ id: `${mockUser.id}_another` }],
      } as unknown as Room;

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();

      authStore.user.nickname = `${authStore.user.nickname} 123`;

      await nextTick();
      expect(updateUserSpy).not.toHaveBeenCalled();
    });
  });
});
