import { describe, expect, it } from "vitest";
import { getZodUsernameValidation } from "../../../utils/validation.ts";

describe("usernameValidator", () => {
  function checkIsValid(username: unknown): boolean {
    return getZodUsernameValidation().safeParse(username).success;
  }

  describe("valid username", () => {
    it("should pass if valid username is provided", () => {
      const username = "username";
      const isValid = checkIsValid(username);

      expect(isValid).toBe(true);
    });

    describe("length boundaries", () => {
      it("should pass if username is as short as possible (=== 3 chars)", () => {
        const username = "use";
        const isValid = checkIsValid(username);

        expect(isValid).toBe(true);
      });

      it("should pass if username is as long as possible (=== 30 chars)", () => {
        const username = "usernameUsernameUsernameUserna";
        const isValid = checkIsValid(username);

        expect(isValid).toBe(true);
      });
    });
  });

  describe("invalid username", () => {
    describe("invalid type", () => {
      it("should fail if username isn't a string", () => {
        const username = null;
        const isValid = checkIsValid(username);

        expect(isValid).toBe(false);
      });
    });

    describe("length boundaries", () => {
      it("should fail if username is an empty string", () => {
        const username = "";
        const isValid = checkIsValid(username);

        expect(isValid).toBe(false);
      });

      it("should fail if username is too short (< 3 chars)", () => {
        const username = "us";
        const isValid = checkIsValid(username);

        expect(isValid).toBe(false);
      });

      it("should fail if username is too long (> 30 chars)", () => {
        const username = "usernameUsernameUsernameUsernam";
        const isValid = checkIsValid(username);

        expect(isValid).toBe(false);
      });
    });
  });
});
