import { describe, expect, it } from "vitest";
import { getZodPasswordValidation } from "../../../utils/validation.ts";

describe("nicknameValidator", () => {
  function validate(
    nickname: unknown,
  ): [isValid: boolean, message: string | undefined] {
    const validationResult = getZodPasswordValidation().safeParse(nickname);

    return [
      validationResult.success,
      validationResult.error?.issues[0]?.message,
    ];
  }

  describe("valid password", () => {
    it("should pass if a valid password is provided", () => {
      const password = "Pass#123";
      const [isValid] = validate(password);

      expect(isValid).toBe(true);
    });

    it("should pass if a valid non-latin password is provided", () => {
      const password = "Паро#123";
      const [isValid] = validate(password);

      expect(isValid).toBe(true);
    });
  });

  describe("invalid password", () => {
    describe("invalid type", () => {
      it("should fail if password isn't a string", () => {
        const password = null;
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Invalid password");
      });
    });

    describe("required elements missing", () => {
      it("should fail if password doesn't contain lowercase letters", () => {
        const password = "PASS#123";
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Must contain at least one lowercase letter");
      });

      it("should fail if password doesn't contain uppercase letters", () => {
        const password = "pass#123";
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Must contain at least one uppercase letter");
      });

      it("should fail if password doesn't contain any digits", () => {
        const password = "Passwor#";
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Must contain at least two digits");
      });

      it("should fail if password doesn't contain two digits", () => {
        const password = "Passwo#1";
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Must contain at least two digits");
      });

      it("should fail if password doesn't contain any special char", () => {
        const password = "Passwo12";
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Must contain at least one special char");
      });
    });

    describe("length boundaries", () => {
      it("should fail if password is too short (< 8 chars)", () => {
        const password = "Pass#12";
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Password is too short (8 chars at min)");
      });

      it("should fail if password is too long (> 512 chars)", () => {
        const password = "Pass#123".repeat(64) + "4";
        const [isValid, message] = validate(password);

        expect(isValid).toBe(false);
        expect(message).toBe("Password is too long (512 chars at max)");
      });
    });
  });
});
