import { describe, expect, it } from "vitest";
import { getZodChangeNicknameBodyValidation } from "../../../../utils/validation.ts";

describe("changeNicknameValidator", () => {
  function checkIsValid(value: unknown): boolean {
    return getZodChangeNicknameBodyValidation().safeParse(value).success;
  }

  describe("valid body", () => {
    it("should pass if a valid value is passed", () => {
      const value = { nickname: "nickname" };
      const isValid = checkIsValid(value);

      expect(isValid).toBe(true);
    });
  });

  describe("invalid body", () => {
    it("should fail if an invalid nickname is passed", () => {
      const value = { nickname: "" };
      const isValid = checkIsValid(value);

      expect(isValid).toBe(false);
    });

    describe("invalid syntax", () => {
      it("should fail if non-object value is provided", () => {
        const value = null;
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });

      it("should fail if an empty object is provided", () => {
        const value = {};
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });

      it("should fail if nickname field is missing", () => {
        const value = { username: "username" };
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const value = { nickname: "nickname", extra: "extra" };
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });
    });
  });
});
