import { describe, expect, it } from "vitest";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "../../../../types/socketEvents.ts";
import { getZodRemoveUserDataValidation } from "../../../../utils/validation.ts";

describe("sendScreenSharingValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodRemoveUserDataValidation().safeParse(message).success;
  }

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.REMOVE_USER] =
        { userId: "userId" };

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
        const message = { userId: "userId", extra: "extra" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid userId is provided", () => {
        const message = { userId: 0e1 };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
