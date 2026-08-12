import { describe, expect, it } from "vitest";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "../../../../types/socketEvents.ts";
import { getZodJoinRoomDataValidation } from "../../../../utils/validation.ts";

describe("joinRoomValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodJoinRoomDataValidation().safeParse(message).success;
  }

  type Message = SocketClientToServerEventsData[typeof SocketEvents.JOIN_ROOM];

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: Message = {
        id: "abc-defg-ijk",
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
        const message = { id: "abc-defg-ijk" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if id is missing", () => {
        const message = { mediaConfig: { audio: true, video: true } };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const message: Message & { extra: string } = {
          id: "abc-defg-ijk",
          mediaConfig: { audio: false, video: true },
          extra: "extra",
        };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid id is provided", () => {
        const message = {
          id: 0e1,
          mediaConfig: { audio: false, video: false },
        };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid mediaConfig is provided", () => {
        const message = {
          id: "abc-defg-ijk",
          mediaConfig: { audio: "false", video: false },
        };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
