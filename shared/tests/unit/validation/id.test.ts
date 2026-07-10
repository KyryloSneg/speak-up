import { describe, expect, it } from "vitest";
import { getZodIdValidation } from "../../../utils/validation.ts";

describe("idValidator", () => {
  function validate(
    id: unknown,
  ): [isValid: boolean, message: string | undefined] {
    const validationResult = getZodIdValidation().safeParse(id);

    return [
      validationResult.success,
      validationResult.error?.issues[0]?.message,
    ];
  }

  describe("valid id", () => {
    it("should pass if valid id is provided", () => {
      const id = "id";
      const [isValid] = validate(id);

      expect(isValid).toBe(true);
    });
  });

  describe("invalid id", () => {
    it("should fail if id isn't a string", () => {
      const id = null;
      const [isValid, message] = validate(id);

      expect(isValid).toBe(false);
      expect(message).toBe("Invalid id");
    });

    it("should fail if id is an empty string", () => {
      const id = "";
      const [isValid, message] = validate(id);

      expect(isValid).toBe(false);
      expect(message).toBe("Required");
    });
  });
});
