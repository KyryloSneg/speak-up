import { describe, expect, it } from "vitest";
import { getZodRoomMaxMembersValidation } from "../../../utils/validation.ts";

describe("roomMaxMembersValidator", () => {
  function checkIsValid(maxMembers: unknown): boolean {
    return getZodRoomMaxMembersValidation().safeParse(maxMembers).success;
  }

  describe("valid maxMembers", () => {
    it("should pass if valid maxMembers is provided", () => {
      const maxMembers = 10;
      const isValid = checkIsValid(maxMembers);

      expect(isValid).toBe(true);
    });

    describe("length boundaries", () => {
      it("should pass if maxMembers is as small as possible (=== 1)", () => {
        const maxMembers = 1;
        const isValid = checkIsValid(maxMembers);

        expect(isValid).toBe(true);
      });

      it("should pass if maxMembers is as big as possible (=== 100)", () => {
        const maxMembers = 100;
        const isValid = checkIsValid(maxMembers);

        expect(isValid).toBe(true);
      });
    });
  });

  describe("invalid maxMembers", () => {
    describe("invalid type", () => {
      it("should fail if maxMembers isn't a number", () => {
        const maxMembers = "1";
        const isValid = checkIsValid(maxMembers);

        expect(isValid).toBe(false);
      });
    });

    describe("length boundaries", () => {
      it("should fail if maxMembers is 0", () => {
        const maxMembers = 0;
        const isValid = checkIsValid(maxMembers);

        expect(isValid).toBe(false);
      });

      it("should fail if maxMembers is too big (> 101)", () => {
        const maxMembers = 101;
        const isValid = checkIsValid(maxMembers);

        expect(isValid).toBe(false);
      });
    });
  });
});
