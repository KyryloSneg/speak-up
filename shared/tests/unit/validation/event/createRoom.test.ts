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

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.CREATE_ROOM] =
        { maxMembers: 10 };

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

      it("should fail if a redundant field is provided", () => {
        const message = { maxMembers: 10, extra: "extra" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid maxMembers is provided", () => {
        const message: SocketClientToServerEventsData[typeof SocketEvents.CREATE_ROOM] =
          { maxMembers: 0 };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
