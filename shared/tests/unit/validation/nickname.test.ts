import { describe, expect, it } from "vitest";
import { getZodNicknameValidation } from "../../../utils/validation.ts";

describe("nicknameValidator", () => {
  function checkIsValid(nickname: unknown): boolean {
    return getZodNicknameValidation().safeParse(nickname).success;
  }

  describe("valid nickname", () => {
    it("should pass if valid nickname is provided", () => {
      const nickname = "nickname";
      const isValid = checkIsValid(nickname);

      expect(isValid).toBe(true);
    });

    describe("length boundaries", () => {
      it("should pass if nickname is as short as possible (=== 1 char)", () => {
        const nickname = "n";
        const isValid = checkIsValid(nickname);

        expect(isValid).toBe(true);
      });

      it("should pass if nickname is as long as possible (=== 30 char)", () => {
        const nickname = "nicknameNicknameNicknameNickna";
        const isValid = checkIsValid(nickname);

        expect(isValid).toBe(true);
      });
    });
  });

  describe("invalid nickname", () => {
    describe("invalid type", () => {
      it("should fail if nickname isn't a string", () => {
        const nickname = null;
        const isValid = checkIsValid(nickname);

        expect(isValid).toBe(false);
      });
    });

    describe("length boundaries", () => {
      it("should fail if nickname is an empty string", () => {
        const nickname = "";
        const isValid = checkIsValid(nickname);

        expect(isValid).toBe(false);
      });

      it("should fail if nickname is too long (> 30 chars)", () => {
        const nickname = "nicknameNicknameNicknameNicknam";
        const isValid = checkIsValid(nickname);

        expect(isValid).toBe(false);
      });
    });
  });
});
