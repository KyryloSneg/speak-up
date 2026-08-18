import { describe, expect, it } from "vitest";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "../../../../types/socketEvents.ts";
import { getZodCreateRoomDataValidation } from "../../../../utils/validation.ts";

describe("createRoomValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodCreateRoomDataValidation().safeParse(message).success;
  }

  type Message =
    SocketClientToServerEventsData[typeof SocketEvents.CREATE_ROOM];

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: Message = {
        maxMembers: 10,
        mediaConfig: { audio: true, video: false },
      };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });
  });

  describe("invalid message", () => {
    describe("invalid syntax", () => {
      it("should fail if a non-object is provided", () => {
        const message = null;

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an empty object is provided", () => {
        const message = {};

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if mediaConfig is missing", () => {
        const message = { maxMembers: 10 };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if maxMembers is missing", () => {
        const message = { mediaConfig: { audio: true, video: true } };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const message: Message & { extra: string } = {
          maxMembers: 10,
          mediaConfig: { audio: false, video: true },
          extra: "extra",
        };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid maxMembers is provided", () => {
        const message: Message = {
          maxMembers: 0,
          mediaConfig: { audio: false, video: false },
        };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid mediaConfig is provided", () => {
        const message: Message = {
          maxMembers: 0,
          mediaConfig: {
            audio: "false",
            video: false,
          } as unknown as Message["mediaConfig"],
        };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
