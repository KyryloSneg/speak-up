import { describe, expect, it } from "vitest";
import type { MessageContentPart } from "../../../types/message.ts";
import { getZodMessageContentPartValidation } from "../../../utils/validation.ts";

describe("messageContentPartValidator", () => {
  function checkIsValid(contentPart: unknown): boolean {
    return getZodMessageContentPartValidation().safeParse(contentPart).success;
  }

  describe("valid contentPart", () => {
    it("should pass if valid contentPart is provided", () => {
      const contentPart: MessageContentPart = { type: "text", value: "value" };
      const isValid = checkIsValid(contentPart);

      expect(isValid).toBe(true);
    });
  });

  describe("invalid contentPart", () => {
    describe("invalid syntax", () => {
      it("should fail if non-MessageContentPart value is provided", () => {
        const contentPart = null;
        const isValid = checkIsValid(contentPart);

        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const contentPart = { type: "text", value: "value", extra: "extra" };
        const isValid = checkIsValid(contentPart);

        expect(isValid).toBe(false);
      });
    });

    describe("invalid field value", () => {
      it("should fail if invalid 'type' is provided", () => {
        const contentPart = { type: "text?", value: "value" };
        const isValid = checkIsValid(contentPart);

        expect(isValid).toBe(false);
      });

      it("should fail if invalid 'value' is provided", () => {
        const contentPart: MessageContentPart = { type: "text", value: "" };
        const isValid = checkIsValid(contentPart);

        expect(isValid).toBe(false);
      });
    });
  });
});
