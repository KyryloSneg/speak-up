import getUnitValue from "@/utils/getUnitValue";
import { describe, expect, it } from "vitest";

describe("getUnitValue", () => {
  it("should properly convert value with a unit to a unitless one", () => {
    const str = "100px";
    const value = getUnitValue(str);

    expect(value).toBe(100);
  });

  it("should leave unitless value as is", () => {
    const str = "100";
    const value = getUnitValue(str);

    expect(value).toBe(100);
  });

  it("should fallback to 0 if an empty string is passed", () => {
    const str = "";
    const value = getUnitValue(str);

    expect(value).toBe(0);
  });

  it("should fallback to 0 if a string is just a unit with no value next to it", () => {
    const str = "rem";
    const value = getUnitValue(str);

    expect(value).toBe(0);
  });
});
