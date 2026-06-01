import { describe, expect, it } from "vitest";
import getNameInitials from "../../utils/getNameInitials.ts";

describe("getNameInitials", () => {
  it("should return a single uppercase character (first char of the word) as initials if a single word is provided", () => {
    const name = "Name";
    const initials = getNameInitials(name);

    expect(initials).toBe("N");
  });

  it("should return two uppercase characters (first chars of both words) as initials if two words are provided", () => {
    const name = "Name Second";
    const initials = getNameInitials(name);

    expect(initials).toBe("NS");
  });

  it("should return two uppercase characters (first chars of first and last words) as initials if more than two words are provided", () => {
    const name = "Name Second Third";
    const initials = getNameInitials(name);

    expect(initials).toBe("NT");
  });
});
