import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import mockSocket from "@/tests/unit/utils/mockSocket";
import { mockUser } from "@/tests/utils/consts";
import type {
  RoomMediaConfig,
  RoomMediaConfigs,
  RoomMediaConfigUserId,
} from "@/types/media";
import type { Room } from "@/types/room";
import { RoutesWithoutParams } from "@/types/routes";
import * as updateUserModule from "@/utils/updateUser";
import {
  SocketEvents,
  SocketResponseEvents,
  type Message,
  type UserDto,
} from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("@/router/index", () => ({ default: { push: vi.fn() } }));
vi.mock("vue-sonner", () => ({ toast: { error: vi.fn() } }));

describe("roomStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    mockSocket.resetMock();

    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  function setupCleanupTests(): void {
    const roomStore = useRoomStore();
    const mediaStore = useMediaStore();

    roomStore.room = { id: "id" } as unknown as Room;
    mediaStore.roomConfigs = new Map();
  }

  function testCleanup(isToRedirect: boolean = true): void {
    const roomStore = useRoomStore();
    const mediaStore = useMediaStore();

    if (isToRedirect) {
      expect(router.push).toHaveBeenCalledExactlyOnceWith(
        RoutesWithoutParams.HOME,
      );
    } else {
      expect(router.push).not.toHaveBeenCalled();
    }

    expect(roomStore.room).toBeNull();
    expect(mediaStore.roomConfigs).toBeNull();
  }

  describe("bindEvents", () => {
    async function baseTestErrorEvent(
      event: string,
      isToInverseExpects: boolean = false,
    ): Promise<void> {
      // create/join/leave
      const roomStore = useRoomStore();
      const error = "Unexpected Error";

      roomStore.bindEvents();
      roomStore.bindEvents();

      await mockSocket.triggerServerEvent(event, {
        error,
      });

      if (isToInverseExpects) {
        expect(toast.error).not.toHaveBeenCalled();
      } else {
        expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
      }
    }

    describe("create room", () => {
      it("should properly listen to received create room event", async () => {
        const authStore = useAuthStore();
        authStore.user = { id: "id" } as unknown as UserDto;

        const roomStore = useRoomStore();
        roomStore.isJoining = true;

        const id = "id" as const;

        roomStore.bindEvents();
        roomStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.CREATE_ROOM, {
          id,
        });

        expect(roomStore.room).toStrictEqual({
          id,
          users: [authStore.user],
          messages: [],
        });

        expect(roomStore.isJoining).toBe(false);
        expect(router.push).toHaveBeenCalledExactlyOnceWith(
          RoutesWithoutParams.ROOM,
        );
      });

      it("should properly listen to received error create room event", async () => {
        const roomStore = useRoomStore();
        roomStore.isJoining = true;

        await baseTestErrorEvent(SocketResponseEvents.CREATE_ROOM);

        expect(roomStore.room).toBeNull();
        expect(roomStore.isJoining).toBe(false);
      });
    });

    describe("join room", () => {
      describe("success", () => {
        it("should properly listen to received join room event", async () => {
          const authStore = useAuthStore();
          authStore.user = { id: "id" } as unknown as UserDto;

          const id = "id" as const;

          const roomStore = useRoomStore();
          const mediaStore = useMediaStore();

          roomStore.roomIdUserIsTryingToJoin = id;
          roomStore.isJoining = true;

          const users: UserDto[] = [
            { id: "anotherId" } as unknown as UserDto,
            authStore.user,
          ];

          const messages: Message[] = [
            {
              id: "id",
              userId: "anotherId",
              user: {
                nickname: mockUser.nickname,
                picture: mockUser.picture,
              },
              content: [{ type: "text", value: "value" }],
              createdAt: new Date().toISOString(),
            },
            {
              id: "anotherId",
              userId: "anotherId",
              user: {
                nickname: mockUser.nickname,
                picture: mockUser.picture,
              },
              content: [{ type: "text", value: "anotherValue" }],
              createdAt: new Date().toISOString(),
            },
          ];

          roomStore.bindEvents();
          roomStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketResponseEvents.JOIN_ROOM, {
            users,
            messages,
          });

          expect(roomStore.room).toStrictEqual({
            id,
            users,
            messages,
          });

          expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
          expect(roomStore.isJoining).toBe(false);
          expect(router.push).toHaveBeenCalledExactlyOnceWith(
            RoutesWithoutParams.ROOM,
          );

          expect(mediaStore.roomConfigs).toStrictEqual(new Map());
        });

        it("should ignore received join room event if user hasn't requested to do so", async () => {
          const authStore = useAuthStore();
          authStore.user = { id: "id" } as unknown as UserDto;

          const roomStore = useRoomStore();
          const mediaStore = useMediaStore();

          const configUserId = "userId" as RoomMediaConfigUserId;

          const roomConfigs: RoomMediaConfigs = new Map();
          roomConfigs.set(configUserId, {
            userId: configUserId,
            audio: true,
            video: true,
          });

          mediaStore.roomConfigs = roomConfigs;

          roomStore.bindEvents();
          roomStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketResponseEvents.JOIN_ROOM, {
            users: [{}],
            messages: [{}],
          });

          expect(roomStore.room).toBeNull();

          expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
          expect(roomStore.isJoining).toBe(false);
          expect(router.push).not.toHaveBeenCalled();

          expect(mediaStore.roomConfigs).toStrictEqual(roomConfigs);
        });
      });

      describe("error", () => {
        it("should properly listen to received error join room event", async () => {
          const id = "id" as const;
          const roomStore = useRoomStore();

          roomStore.roomIdUserIsTryingToJoin = id;
          roomStore.isJoining = true;

          await baseTestErrorEvent(SocketResponseEvents.JOIN_ROOM);

          expect(roomStore.room).toBeNull();
          expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
          expect(roomStore.isJoining).toBe(false);
        });

        it("should ignore received error join room event if user hasn't requested to do so", async () => {
          const roomStore = useRoomStore();
          const room: Room = { id: "id" } as unknown as Room;

          roomStore.room = room;

          await baseTestErrorEvent(SocketResponseEvents.JOIN_ROOM, true);

          expect(roomStore.room).toStrictEqual(room);
          expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
        });
      });
    });

    describe("leave room", () => {
      it("should properly listen to received error leave room event", async () =>
        await baseTestErrorEvent(SocketResponseEvents.LEAVE_ROOM));
    });

    describe("user joined", () => {
      it("should properly listen to received user joined event", async () => {
        const initUser: UserDto = { id: "id" } as unknown as UserDto;

        const roomStore = useRoomStore();
        const room: Room = { id: "id", users: [initUser] } as unknown as Room;

        roomStore.room = room;

        const joinedUser: UserDto = { id: "id" } as unknown as UserDto;

        roomStore.bindEvents();
        roomStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.USER_JOINED, {
          user: joinedUser,
        });

        expect(roomStore.room.users.length).toBe(2);

        expect(roomStore.room.users).toContainEqual(initUser);
        expect(roomStore.room.users).toContainEqual(joinedUser);
      });

      it("should ignore received user joined event if user isn't in any room", async () => {
        const roomStore = useRoomStore();

        const joinedUser: UserDto = { id: "id" } as unknown as UserDto;
        await mockSocket.triggerServerEvent(SocketEvents.USER_JOINED, {
          user: joinedUser,
        });

        expect(roomStore.room).toBeNull();
      });
    });

    describe("user left", () => {
      it("should properly listen to received user left event", async () => {
        const targetUser: UserDto = { id: "id" } as unknown as UserDto;
        const userToLeave: UserDto = {
          id: "anotherId",
        } as unknown as UserDto;

        const roomStore = useRoomStore();
        const mediaStore = useMediaStore();

        const room: Room = {
          id: "id",
          users: [targetUser, userToLeave],
        } as unknown as Room;

        roomStore.room = room;

        const roomConfigs: RoomMediaConfigs = new Map();

        const targetUserConfigId = targetUser.id as RoomMediaConfigUserId;
        const userToLeaveConfigId = userToLeave.id as RoomMediaConfigUserId;

        const targetUserConfig: RoomMediaConfig = {
          userId: targetUserConfigId,
          audio: true,
          video: true,
        } as const;

        roomConfigs.set(targetUserConfigId, targetUserConfig);
        roomConfigs.set(userToLeaveConfigId, {
          userId: userToLeaveConfigId,
          audio: true,
          video: true,
        });

        mediaStore.roomConfigs = roomConfigs;

        roomStore.bindEvents();
        roomStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.USER_LEFT, {
          userId: userToLeave.id,
        });

        expect(roomStore.room.users).toStrictEqual([targetUser]);

        expect(mediaStore.roomConfigs.size).toBe(1);
        expect(mediaStore.roomConfigs.get(targetUserConfigId)).toStrictEqual(
          targetUserConfig,
        );
      });

      it("should ignore received user left event if user isn't in any room", async () => {
        const userToLeave: UserDto = {
          id: "anotherId",
        } as unknown as UserDto;

        const roomStore = useRoomStore();
        const mediaStore = useMediaStore();

        await mockSocket.triggerServerEvent(SocketEvents.USER_LEFT, {
          userId: userToLeave.id,
        });

        expect(roomStore.room).toBeNull();
        expect(mediaStore.roomConfigs).toBeNull();
      });
    });

    describe("left room", () => {
      describe("success", () => {
        it("should properly listen to received left room event", async () => {
          const room: Room = { id: "id" } as unknown as Room;
          const roomConfigs = new Map();

          const roomStore = useRoomStore();
          const mediaStore = useMediaStore();

          roomStore.room = room;
          mediaStore.roomConfigs = roomConfigs;

          roomStore.bindEvents();
          roomStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.LEFT_ROOM, {
            id: room.id,
          });

          testCleanup(true);
        });
      });

      describe("ignore", () => {
        it("should ignore received left room event if user isn't in any room", async () => {
          const roomStore = useRoomStore();

          roomStore.bindEvents();
          roomStore.bindEvents();

          // basically, clearing cleaned-up state does nothing (even if we
          // ignore the handler's main logic)
          await mockSocket.triggerServerEvent(SocketEvents.LEFT_ROOM, {
            id: "id",
          });

          testCleanup(false);
        });

        it("should ignore received left room event if user is in a different room", async () => {
          const room: Room = { id: "id" } as unknown as Room;
          const roomConfigs = new Map();

          const roomStore = useRoomStore();
          const mediaStore = useMediaStore();

          roomStore.room = room;
          mediaStore.roomConfigs = roomConfigs;

          roomStore.bindEvents();
          roomStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.LEFT_ROOM, {
            id: "anotherId",
          });

          expect(roomStore.room).toStrictEqual(room);
          expect(mediaStore.roomConfigs).toStrictEqual(roomConfigs);
        });
      });
    });

    describe("changed nickname", () => {
      describe("success", () => {
        it("should properly listen to received changed nickname event (user is the target; nickname, picture + letter picture change)", async () => {
          const room: Room = {
            id: "id",
            users: [
              mockUser,
              {
                id: "anotherId",
                nickname: "anotherNickname",
                picture: "anotherPicture",
                letterPicture: "anotherLetterPicture",
              },
            ],
          } as unknown as Room;

          const authStore = useAuthStore();
          const roomStore = useRoomStore();

          authStore.user = mockUser;
          roomStore.room = room;

          roomStore.bindEvents();
          roomStore.bindEvents();

          const newData = {
            nickname: `${authStore.user.nickname} 123`,
            picture: `${authStore.user.picture}_new`,
            letterPicture: `${authStore.user.letterPicture}_new`,
          } as const;

          await mockSocket.triggerServerEvent(SocketEvents.CHANGED_NICKNAME, {
            userId: authStore.user.id,
            ...newData,
          });

          const targets = [authStore.user, room.users[0]!] as const;

          targets.forEach(target => {
            expect(target.nickname).toBe(newData.nickname);
            expect(target.picture).toBe(newData.picture);
            expect(target.letterPicture).toBe(newData.letterPicture);
          });

          expect(roomStore.room.users[1]).toStrictEqual(room.users[1]);
        });

        it("should properly listen to received changed nickname event (other user is the target; just a nickname change)", async () => {
          const anotherUser = {
            id: "anotherId",
            nickname: "anotherNickname",
            picture: "anotherPicture",
            letterPicture: "anotherLetterPicture",
          } as unknown as UserDto;

          const room: Room = {
            id: "id",
            users: [mockUser, anotherUser],
          } as unknown as Room;

          const authStore = useAuthStore();
          const roomStore = useRoomStore();

          authStore.user = mockUser;
          roomStore.room = room;

          roomStore.bindEvents();
          roomStore.bindEvents();

          const newData = {
            nickname: `${anotherUser.nickname}_123`,
          } as const;

          await mockSocket.triggerServerEvent(SocketEvents.CHANGED_NICKNAME, {
            userId: anotherUser?.id,
            ...newData,
          });

          expect(room.users[1]!.nickname).toBe(newData.nickname);
          expect(room.users[1]!.picture).toBe(anotherUser.picture);
          expect(room.users[1]!.letterPicture).toBe(anotherUser.letterPicture);

          expect(roomStore.room.users[0]).toStrictEqual(mockUser);
          expect(authStore.user).toStrictEqual(mockUser);
        });
      });

      describe("ignore", () => {
        it("should ignore received changed nickname event if user isn't in any room and event's target is not this user", async () => {
          const updateUserSpy = vi.spyOn(updateUserModule, "default");

          const authStore = useAuthStore();
          const roomStore = useRoomStore();

          authStore.user = mockUser;

          roomStore.bindEvents();
          roomStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketEvents.CHANGED_NICKNAME, {
            userId: `${authStore.user.id}123`,
            nickname: "newNickname",
          });

          expect(authStore.user).toStrictEqual(mockUser);
          expect(updateUserSpy).not.toHaveBeenCalled(); // just in case
        });
      });
    });
  });

  describe("cleanup", () => {
    beforeEach(() => {
      setupCleanupTests();
    });

    it("should properly cleanup room-related state with redirect", () => {
      const roomStore = useRoomStore();
      roomStore.cleanup(true);

      testCleanup(true);
    });

    it("should properly cleanup room-related state with no redirect", () => {
      const roomStore = useRoomStore();
      roomStore.cleanup(false);

      testCleanup(false);
    });
  });

  describe("createRoom", () => {
    it("should properly emit create room event", () => {
      const roomStore = useRoomStore();
      const maxMembers = 10;

      roomStore.createRoom(maxMembers);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.CREATE_ROOM,
        { maxMembers },
      );

      expect(roomStore.isJoining).toBe(true);
    });
  });

  describe("joinRoom", () => {
    it("should properly emit join room message event", () => {
      const roomStore = useRoomStore();
      const id = "id";

      roomStore.joinRoom(id);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.JOIN_ROOM,
        { id },
      );

      expect(roomStore.roomIdUserIsTryingToJoin).toBe(id);
      expect(roomStore.isJoining).toBe(true);
    });
  });

  describe("leaveRoom", () => {
    it("should properly emit leave room event with redirect", () => {
      const roomStore = useRoomStore();
      setupCleanupTests();

      roomStore.leaveRoom(true);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.LEAVE_ROOM,
      );

      testCleanup();
    });

    it("should properly emit leave room event with no redirect", () => {
      const roomStore = useRoomStore();
      setupCleanupTests();

      roomStore.leaveRoom(false);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.LEAVE_ROOM,
      );

      testCleanup(false);
    });
  });
});
