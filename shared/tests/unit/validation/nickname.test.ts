import { describe, expect, it } from "vitest";
import { getZodNicknameValidation } from "../../../utils/validation.ts";

describe("nicknameValidator", () => {
  function validate(
    nickname: unknown,
  ): [isValid: boolean, message: string | undefined] {
    const validationResult = getZodNicknameValidation().safeParse(nickname);

    return [
      validationResult.success,
      validationResult.error?.issues[0]?.message,
    ];
  }

  describe("valid nickname", () => {
    it("should pass if valid nickname is provided", () => {
      const nickname = "nickname";
      const [isValid] = validate(nickname);

      expect(isValid).toBe(true);
    });

    describe("length boundaries", () => {
      it("should pass if nickname is as short as possible (=== 1 char)", () => {
        const nickname = "n";
        const [isValid] = validate(nickname);

        expect(isValid).toBe(true);
      });

      it("should pass if nickname is as long as possible (=== 30 char)", () => {
        const nickname = "nicknameNicknameNicknameNickna";
        const [isValid] = validate(nickname);

        expect(isValid).toBe(true);
      });
    });
  });

  describe("invalid nickname", () => {
    describe("invalid type", () => {
      it("should fail if nickname isn't a string", () => {
        const nickname = null;
        const [isValid, message] = validate(nickname);

        expect(isValid).toBe(false);
        expect(message).toBe("Invalid nickname");
      });
    });

    describe("length boundaries", () => {
      it("should fail if nickname is an empty string", () => {
        const nickname = "";
        const [isValid, message] = validate(nickname);

        expect(isValid).toBe(false);
        expect(message).toBe("Required");
      });

      it("should fail if nickname is too long (> 30 chars)", () => {
        const nickname = "nicknameNicknameNicknameNicknam";
        const [isValid, message] = validate(nickname);

        expect(isValid).toBe(false);
        expect(message).toBe("Nickname is too long");
      });
    });
  });
});
