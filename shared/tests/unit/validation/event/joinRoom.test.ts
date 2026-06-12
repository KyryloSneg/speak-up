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

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.JOIN_ROOM] =
        { id: "abc-defg-ijk" };

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
        const message = { id: "abc-defg-ijk", extra: "extra" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid id is provided", () => {
        const message = { id: 0e1 };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
