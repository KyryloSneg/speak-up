import { describe, expect, it } from "vitest";
import type { MessageContent } from "../../../types/message.ts";
import { getZodMessageContentValidation } from "../../../utils/validation.ts";

describe("messageContentValidator", () => {
  function checkIsValid(content: unknown): boolean {
    return getZodMessageContentValidation().safeParse(content).success;
  }

  describe("valid content", () => {
    it("should pass if valid content is provided", () => {
      const content: MessageContent = [{ type: "text", value: "value" }];
      const isValid = checkIsValid(content);

      expect(isValid).toBe(true);
    });
  });

  describe("invalid content", () => {
    describe("invalid syntax", () => {
      it("should fail if non-MessageContent value is provided", () => {
        const content = null;
        const isValid = checkIsValid(content);

        expect(isValid).toBe(false);
      });

      it("should fail if an empty array is provided", () => {
        const content = [] as const;
        const isValid = checkIsValid(content);

        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if content contains an invalid content part", () => {
        const content: MessageContent = [{ type: "text", value: "" }];
        const isValid = checkIsValid(content);

        expect(isValid).toBe(false);
      });
    });
  });
});
