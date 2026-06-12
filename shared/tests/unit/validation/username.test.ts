import { describe, expect, it } from "vitest";
import { getZodUsernameValidation } from "../../../utils/validation.ts";

describe("usernameValidator", () => {
  function validate(
    nickname: unknown,
  ): [isValid: boolean, message: string | undefined] {
    const validationResult = getZodUsernameValidation().safeParse(nickname);

    return [
      validationResult.success,
      validationResult.error?.issues[0]?.message,
    ];
  }

  describe("valid username", () => {
    it("should pass if valid username is provided", () => {
      const username = "username";
      const [isValid] = validate(username);

      expect(isValid).toBe(true);
    });

    describe("length boundaries", () => {
      it("should pass if username is as short as possible (=== 3 chars)", () => {
        const username = "use";
        const [isValid] = validate(username);

        expect(isValid).toBe(true);
      });

      it("should pass if username is as long as possible (=== 30 chars)", () => {
        const username = "usernameUsernameUsernameUserna";
        const [isValid] = validate(username);

        expect(isValid).toBe(true);
      });
    });
  });

  describe("invalid username", () => {
    describe("invalid type", () => {
      it("should fail if username isn't a string", () => {
        const username = null;
        const [isValid, message] = validate(username);

        expect(isValid).toBe(false);
        expect(message).toBe("Invalid username");
      });
    });

    describe("length boundaries", () => {
      it("should fail if username is an empty string", () => {
        const username = "";
        const [isValid, message] = validate(username);

        expect(isValid).toBe(false);
        expect(message).toBe("Required");
      });

      it("should fail if username is too short (< 3 chars)", () => {
        const username = "us";
        const [isValid, message] = validate(username);

        expect(isValid).toBe(false);
        expect(message).toBe("Username is too short");
      });

      it("should fail if username is too long (> 30 chars)", () => {
        const username = "usernameUsernameUsernameUsernam";
        const [isValid, message] = validate(username);

        expect(isValid).toBe(false);
        expect(message).toBe("Username is too long");
      });
    });
  });
});
