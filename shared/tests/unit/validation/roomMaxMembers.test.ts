import { describe, expect, it } from "vitest";
import { getZodRoomMaxMembersValidation } from "../../../utils/validation.ts";

describe("roomMaxMembersValidator", () => {
  function validate(
    nickname: unknown,
  ): [isValid: boolean, message: string | undefined] {
    const validationResult =
      getZodRoomMaxMembersValidation().safeParse(nickname);

    return [
      validationResult.success,
      validationResult.error?.issues[0]?.message,
    ];
  }

  describe("valid maxMembers", () => {
    it("should pass if valid maxMembers is provided", () => {
      const maxMembers = 10;
      const [isValid] = validate(maxMembers);

      expect(isValid).toBe(true);
    });

    it("should pass if maxMembers is coerceable to a number", () => {
      const maxMembers = "1";
      const [isValid] = validate(maxMembers);

      expect(isValid).toBe(true);
    });

    describe("length boundaries", () => {
      it("should pass if maxMembers is as small as possible (=== 1)", () => {
        const maxMembers = 1;
        const [isValid] = validate(maxMembers);

        expect(isValid).toBe(true);
      });

      it("should pass if maxMembers is as big as possible (=== 100)", () => {
        const maxMembers = 100;
        const [isValid] = validate(maxMembers);

        expect(isValid).toBe(true);
      });
    });
  });

  describe("invalid maxMembers", () => {
    it("should fail if maxMembers is not a valid type", () => {
      const maxMembers = null;
      const [isValid, message] = validate(maxMembers);

      expect(isValid).toBe(false);
      expect(message).toBe("Invalid max members");
    });

    it("should fail if an empty string is passed", () => {
      const maxMembers = "";
      const [isValid, message] = validate(maxMembers);

      expect(isValid).toBe(false);
      expect(message).toBe("Invalid max members");
    });

    describe("length boundaries", () => {
      it("should fail if maxMembers is 0", () => {
        const maxMembers = 0;
        const [isValid, message] = validate(maxMembers);

        expect(isValid).toBe(false);
        expect(message).toBe("Too few members");
      });

      it("should fail if maxMembers is too big (> 101)", () => {
        const maxMembers = 101;
        const [isValid, message] = validate(maxMembers);

        expect(isValid).toBe(false);
        expect(message).toBe("Too many members");
      });
    });
  });
});
