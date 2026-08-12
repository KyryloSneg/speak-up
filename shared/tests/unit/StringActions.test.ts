import { describe, expect, it } from "vitest";
import StringActions from "../../utils/StringActions.ts";

describe("StringActions", () => {
  describe("capitalize", () => {
    it("should properly capitalize word", () => {
      const str = "string";
      const result = StringActions.capitalize(str);

      expect(result).toBe("String");
    });

    it("should leave capitalized word as is", () => {
      const str = "String";
      const result = StringActions.capitalize(str);

      expect(result).toBe("String");
    });

    it("should leave non-first string chars as is", () => {
      const str = "stRInG";
      const result = StringActions.capitalize(str);

      expect(result).toBe("StRInG");
    });

    it("should properly capitalize the first char of the sentence", () => {
      const str = "string is not a 12 NUMber 21.";
      const result = StringActions.capitalize(str);

      expect(result).toBe("String is not a 12 NUMber 21.");
    });

    it("should leave an empty string as is", () => {
      const str = "";
      const capitalized = StringActions.capitalize(str);

      expect(capitalized).toBe("");
    });
  });
});
