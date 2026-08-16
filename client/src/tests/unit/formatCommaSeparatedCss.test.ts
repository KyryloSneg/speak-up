import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";
import { describe, expect, it } from "vitest";

describe("formatCommaSeparatedCss", () => {
  it("should remove redundant spaces", () => {
    const str = "  rgb( 0, 170, 255 ) ";
    const value = formatCommaSeparatedCss(str);

    expect(value).toBe("rgb(0, 170, 255)");
  });

  it("should remove redundant breaks", () => {
    const str = `
      background-color 0.3s ease,
      opacity 400ms ease-in-out
    `;

    const value = formatCommaSeparatedCss(str);
    expect(value).toBe("background-color 0.3s ease, opacity 400ms ease-in-out");
  });
});
