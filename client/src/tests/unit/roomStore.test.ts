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
import type { Room, RoomUser } from "@/types/room";
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

const mockWebRTCStore = {
  stop: vi.fn(),
  createPeerConnection: vi.fn(),
  removePeerConnection: vi.fn(),
};

vi.mock("@/stores/webrtc", () => ({
  useWebRTCStore: () => mockWebRTCStore,
}));

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
    roomStore.openedWindow = "chat";
    roomStore.memberListTrigger = "trigger";
    roomStore.maxMembersOfFutureRoom = 10;
    roomStore.roomIdUserIsTryingToJoin = "id";
    roomStore.initSentMediaConfig = { audio: true, video: true };
    roomStore.pinnedItems = [];
    roomStore.fullScreenItem = { userId: "userId", type: "user" };
    roomStore.memberAnnouncerText = "text";
    roomStore.isJoining = true;
  }

  function testCleanup(isToRedirect: boolean = true): void {
    const roomStore = useRoomStore();
    const mediaStore = useMediaStore();

    if (isToRedirect) {
      expect(roomStore.isToSupressLeaveConfirm).toBe(true);
      expect(router.push).toHaveBeenCalledExactlyOnceWith(
        RoutesWithoutParams.HOME,
      );
    } else {
      expect(router.push).not.toHaveBeenCalled();
    }

    expect(roomStore.room).toBeNull();
    expect(mediaStore.roomConfigs).toBeNull();
    expect(roomStore.openedWindow).toBeNull();
    expect(roomStore.memberListTrigger).toBeNull();
    expect(roomStore.maxMembersOfFutureRoom).toBeNull();
    expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
    expect(roomStore.initSentMediaConfig).toBeNull();
    expect(roomStore.pinnedItems).toBeNull();
    expect(roomStore.fullScreenItem).toBeNull();
    expect(roomStore.memberAnnouncerText).toBe("");
    expect(roomStore.isJoining).toBe(false);

    expect(mockWebRTCStore.stop).toHaveBeenCalledOnce();
  }

  describe("bindEvents", () => {
    async function baseTestErrorEvent(
      event: string,
      isToInverseExpects: boolean = false,
    ): Promise<void> {
      const roomStore = useRoomStore();
      const error = "Unexpected Error";

      if (!isToInverseExpects) {
        roomStore.maxMembersOfFutureRoom = 10;
        roomStore.roomIdUserIsTryingToJoin = "id";
      }

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
        const mediaStore = useMediaStore();

        authStore.user = { id: "id" } as unknown as UserDto;

        const roomStore = useRoomStore();
        const maxMembers = 10;
        const id = "id" as const;

        roomStore.maxMembersOfFutureRoom = maxMembers;
        roomStore.initSentMediaConfig = mediaStore.config;
        roomStore.isJoining = true;

        roomStore.bindEvents();
        roomStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.CREATE_ROOM, {
          id,
        });

        expect(roomStore.room).toStrictEqual({
          id,
          hostId: authStore.user.id,
          users: [authStore.user],
          messages: [],
          maxMembers,
        });

        expect(roomStore.pinnedItems).toStrictEqual([]);
        expect(mediaStore.roomConfigs).toStrictEqual(new Map());
        expect(roomStore.isJoining).toBe(false);
        expect(router.push).toHaveBeenCalledExactlyOnceWith(
          RoutesWithoutParams.ROOM,
        );
      });

      it("should send updated media config if mediaConfig changed before create room response", async () => {
        const authStore = useAuthStore();
        const mediaStore = useMediaStore();

        authStore.user = { id: "id" } as unknown as UserDto;

        const sendMediaConfigSpy = vi.spyOn(mediaStore, "sendMediaConfig");
        const roomStore = useRoomStore();

        roomStore.maxMembersOfFutureRoom = 10;
        roomStore.initSentMediaConfig = { audio: false, video: false };
        roomStore.isJoining = true;

        roomStore.bindEvents();
        roomStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.CREATE_ROOM, {
          id: "id",
        });

        expect(sendMediaConfigSpy).toHaveBeenCalledWith(mediaStore.config);
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
          const hostId = "hostId" as const;
          const maxMembers = 10;

          const roomStore = useRoomStore();
          const mediaStore = useMediaStore();

          roomStore.roomIdUserIsTryingToJoin = id;
          roomStore.initSentMediaConfig = mediaStore.config;
          roomStore.isJoining = true;

          const otherUserId = "anotherId" as RoomMediaConfigUserId;
          const users: UserDto[] = [
            { id: otherUserId } as unknown as UserDto,
            authStore.user,
          ];

          const messages: Message[] = [
            {
              id: "msg1",
              userId: otherUserId,
              user: {
                nickname: mockUser.nickname,
                picture: mockUser.picture,
              },
              content: [{ type: "text", value: "value" }],
              createdAt: new Date().toISOString(),
            },
          ];

          const mediaConfigs = {
            [otherUserId]: { audio: true, video: false },
            [authStore.user.id]: { audio: true, video: true },
          };

          roomStore.bindEvents();
          roomStore.bindEvents();

          await mockSocket.triggerServerEvent(SocketResponseEvents.JOIN_ROOM, {
            hostId,
            users,
            messages,
            maxMembers,
            mediaConfigs,
          });

          expect(roomStore.room).toStrictEqual({
            id,
            hostId,
            users,
            messages,
            maxMembers,
          });

          expect(roomStore.pinnedItems).toStrictEqual([]);
          expect(roomStore.roomIdUserIsTryingToJoin).toBeNull();
          expect(roomStore.isJoining).toBe(false);
          expect(router.push).toHaveBeenCalledExactlyOnceWith(
            RoutesWithoutParams.ROOM,
          );

          const expectedConfigs = new Map([
            [otherUserId, { userId: otherUserId, audio: true, video: false }],
          ]);

          expect(mediaStore.roomConfigs).toStrictEqual(expectedConfigs);
          expect(mockWebRTCStore.createPeerConnection).toHaveBeenCalledWith(
            otherUserId,
          );

          expect(mockWebRTCStore.createPeerConnection).not.toHaveBeenCalledWith(
            authStore.user.id,
          );
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
            hostId: "hostId",
            users: [{}],
            messages: [{}],
            maxMembers: 10,
            mediaConfigs: {},
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
        const mediaStore = useMediaStore();
        mediaStore.roomConfigs = new Map();

        const initUser: UserDto = {
          id: "id",
          nickname: "init",
        } as unknown as UserDto;

        const roomStore = useRoomStore();
        const room: Room = {
          id: "id",
          users: [initUser],
          messages: [],
        } as unknown as Room;

        roomStore.room = room;

        const joinedUser: UserDto = {
          id: "joinedId",
          nickname: "JoinedUser",
        } as unknown as UserDto;
        const mediaConfig = { audio: true, video: false };

        roomStore.bindEvents();
        roomStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.USER_JOINED, {
          user: joinedUser,
          mediaConfig,
        });

        expect(roomStore.room.users.length).toBe(2);
        expect(roomStore.room.users).toContainEqual(initUser);
        expect(roomStore.room.users).toContainEqual(joinedUser);

        expect(
          mediaStore.roomConfigs.get(joinedUser.id as RoomMediaConfigUserId),
        ).toStrictEqual({
          userId: joinedUser.id,
          ...mediaConfig,
        });

        expect(mockWebRTCStore.createPeerConnection).toHaveBeenCalledWith(
          joinedUser.id,
        );

        expect(roomStore.memberAnnouncerText).toBe(
          'User "JoinedUser" have joined',
        );
      });

      it("should ignore received user joined event if user isn't in any room", async () => {
        const roomStore = useRoomStore();

        const joinedUser: UserDto = { id: "id" } as unknown as UserDto;
        await mockSocket.triggerServerEvent(SocketEvents.USER_JOINED, {
          user: joinedUser,
          mediaConfig: { audio: true, video: true },
        });

        expect(roomStore.room).toBeNull();
      });
    });

    describe("user left", () => {
      it("should properly listen to received user left event", async () => {
        const targetUser: UserDto = {
          id: "id",
          nickname: "target",
        } as unknown as UserDto;
        const userToLeave: UserDto = {
          id: "anotherId",
          nickname: "leavingUser",
        } as unknown as UserDto;

        const roomStore = useRoomStore();
        const mediaStore = useMediaStore();

        const room: Room = {
          id: "id",
          users: [targetUser, userToLeave],
          messages: [],
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
        expect(mockWebRTCStore.removePeerConnection).toHaveBeenCalledWith(
          userToLeave.id,
        );
        expect(roomStore.memberAnnouncerText).toBe(
          'User "leavingUser" have left',
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

          await mockSocket.triggerServerEvent(SocketEvents.LEFT_ROOM, {
            id: "id",
          });

          expect(router.push).not.toHaveBeenCalled();
          expect(roomStore.room).toBeNull();
          expect(mockWebRTCStore.stop).not.toHaveBeenCalled();
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
          const userMessageUser = { ...mockUser };
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
            messages: [
              {
                id: "msg1",
                userId: mockUser.id,
                user: userMessageUser,
                content: [{ type: "text", value: "hello" }],
                createdAt: new Date().toISOString(),
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

          const targets = [
            authStore.user,
            room.users[0]!,
            userMessageUser,
          ] as const;

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

          const anotherMessageUser = { ...anotherUser };
          const room: Room = {
            id: "id",
            users: [mockUser, anotherUser],
            messages: [
              {
                id: "msg1",
                userId: anotherUser.id,
                user: anotherMessageUser,
                content: [{ type: "text", value: "hello" }],
                createdAt: new Date().toISOString(),
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
            nickname: `${anotherUser.nickname}_123`,
          } as const;

          await mockSocket.triggerServerEvent(SocketEvents.CHANGED_NICKNAME, {
            userId: anotherUser.id,
            ...newData,
          });

          expect(room.users[1]!.nickname).toBe(newData.nickname);
          expect(room.users[1]!.picture).toBe(anotherUser.picture);
          expect(room.users[1]!.letterPicture).toBe(anotherUser.letterPicture);

          expect(anotherMessageUser.nickname).toBe(newData.nickname);

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
          expect(updateUserSpy).not.toHaveBeenCalled();
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
    it("should properly emit create room event and set store state", () => {
      const roomStore = useRoomStore();
      const mediaStore = useMediaStore();
      const maxMembers = 10;

      roomStore.createRoom(maxMembers);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.CREATE_ROOM,
        {
          maxMembers,
          mediaConfig: mediaStore.config,
        },
      );

      expect(roomStore.maxMembersOfFutureRoom).toBe(maxMembers);
      expect(roomStore.initSentMediaConfig).toBe(mediaStore.config);
      expect(roomStore.isJoining).toBe(true);
    });
  });

  describe("joinRoom", () => {
    it("should properly emit join room message event and set store state", () => {
      const roomStore = useRoomStore();
      const mediaStore = useMediaStore();
      const id = "id";

      roomStore.joinRoom(id);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.JOIN_ROOM,
        {
          id,
          mediaConfig: mediaStore.config,
        },
      );

      expect(roomStore.roomIdUserIsTryingToJoin).toBe(id);
      expect(roomStore.initSentMediaConfig).toBe(mediaStore.config);
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

      testCleanup(true);
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

  describe("sortedUsers", () => {
    it("should return empty array if room is null", () => {
      const roomStore = useRoomStore();
      expect(roomStore.sortedUsers).toStrictEqual([]);
    });

    it("should correctly sort users putting current user first and ordering others by lastSpeakedAt", () => {
      const authStore = useAuthStore();
      const roomStore = useRoomStore();

      const authUser = { id: "authId", nickname: "Auth" } as UserDto;
      authStore.user = authUser;

      const date1 = new Date("2026-01-01T10:00:00Z");
      const date2 = new Date("2026-01-01T11:00:00Z");

      const userNeverSpoke = { id: "u1", nickname: "NeverSpoke" } as RoomUser;
      const userSpokeLater = {
        id: "u2",
        nickname: "SpokeLater",
        lastSpeakedAt: date2,
      } as RoomUser;

      const userSpokeEarlier = {
        id: "u3",
        nickname: "SpokeEarlier",
        lastSpeakedAt: date1,
      } as RoomUser;

      roomStore.room = {
        id: "room1",
        users: [userNeverSpoke, userSpokeLater, authUser, userSpokeEarlier],
      } as unknown as Room;

      expect(roomStore.sortedUsers).toStrictEqual([
        authUser,
        userSpokeEarlier,
        userSpokeLater,
        userNeverSpoke,
      ]);
    });
  });
});
