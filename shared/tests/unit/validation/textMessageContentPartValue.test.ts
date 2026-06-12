import { describe, expect, it } from "vitest";
import { getZodTextMessageContentPartValueValidation } from "../../../utils/validation.ts";

describe("textMessageContentPartValueValidator", () => {
  function checkIsValid(value: unknown): boolean {
    return getZodTextMessageContentPartValueValidation().safeParse(value)
      .success;
  }

  describe("valid value", () => {
    it("should pass if valid value is provided", () => {
      const value = "value";
      const isValid = checkIsValid(value);

      expect(isValid).toBe(true);
    });

    describe("length boundaries", () => {
      it("should pass if value is as short as possible (=== 1 char)", () => {
        const value = "v";
        const isValid = checkIsValid(value);

        expect(isValid).toBe(true);
      });

      it("should pass if value is as long as possible (=== 1000 chars)", () => {
        const value = "v".repeat(1000);
        const isValid = checkIsValid(value);

        expect(isValid).toBe(true);
      });
    });
  });

  describe("invalid value", () => {
    describe("invalid type", () => {
      it("should fail if value isn't a string", () => {
        const value = null;
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });
    });

    describe("length boundaries", () => {
      it("should fail if value is an empty string", () => {
        const value = "";
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });

      it("should fail if value is too long (> 1000 chars)", () => {
        const value = "v".repeat(1001);
        const isValid = checkIsValid(value);

        expect(isValid).toBe(false);
      });
    });
  });
});
