import { describe, expect, it } from "vitest";
import { getZodRegisterBodyValidation } from "../../../../utils/validation.ts";

describe("registerValidator", () => {
  function checkIsValid(value: unknown): boolean {
    return getZodRegisterBodyValidation().safeParse(value).success;
  }

  describe("valid body", () => {
    it("should pass if a valid value is passed", () => {
      const value = {
        nickname: "nickname",
        username: "username",
        password: "Pass#123",
      };

      const isValid = checkIsValid(value);
      expect(isValid).toBe(true);
    });
  });

  describe("invalid body", () => {
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

      it("should fail if nickname is missing", () => {
        const value = { username: "username", password: "Pass#123" };
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });

      it("should fail if username is missing", () => {
        const value = { nickname: "nickname", password: "Pass#123" };
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });

      it("should fail if password is missing", () => {
        const value = { nickname: "nickname", username: "username" };
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const value = {
          nickname: "nickname",
          username: "username",
          password: "Pass#123",
          extra: "extra",
        };

        const isValid = checkIsValid(value);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid nickname is passed", () => {
        const value = {
          nickname: "",
          username: "username",
          password: "Pass#123",
        };

        const isValid = checkIsValid(value);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid username is passed", () => {
        const value = {
          nickname: "nickname",
          username: "",
          password: "Pass#123",
        };

        const isValid = checkIsValid(value);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid password is passed", () => {
        const value = {
          nickname: "nickname",
          username: "username",
          password: "password",
        };

        const isValid = checkIsValid(value);
        expect(isValid).toBe(false);
      });

      it("should fail if invalid nickname, username and password are passed", () => {
        const value = { nickname: "", username: "", password: "password" };
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });
    });
  });
});
