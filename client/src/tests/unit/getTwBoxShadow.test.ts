import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";
import getTwBoxShadow from "@/utils/getTwBoxShadow";
import { describe, expect, it } from "vitest";

describe("getTwBoxShadow", () => {
  it("should properly combine box-shadow value with tw shadows", () => {
    const customShadow = "10px 10px 5px 0px red";
    const value = getTwBoxShadow(customShadow);

    expect(value).toBe(formatCommaSeparatedCss(value));
    const shadows = value.split(",");

    expect(shadows).toStrictEqual(Array.from(new Set(shadows)));

    expect(shadows.includes("var(--tw-inset-shadow)"));
    expect(shadows.includes("var(--tw-inset-ring-shadow)"));
    expect(shadows.includes("var(--tw-ring-offset-shadow)"));
    expect(shadows.includes("var(--tw-ring-shadow)"));
    expect(shadows.includes("var(--tw-shadow)"));

    expect(shadows.includes(customShadow));
  });
});
