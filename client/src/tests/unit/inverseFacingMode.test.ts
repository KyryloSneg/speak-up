import { FacingModes } from "@/types/media";
import inverseFacingMode from "@/utils/inverseFacingMode";
import { describe, expect, it } from "vitest";

describe("inverseFacingMode", () => {
  it("should properly inverse 'user' facing mode to the 'environment' one", () => {
    const result = inverseFacingMode(FacingModes.USER);
    expect(result).toBe(FacingModes.ENVIRONMENT);
  });

  it("should properly inverse 'environment' facing mode to the 'user' one", () => {
    const result = inverseFacingMode(FacingModes.ENVIRONMENT);
    expect(result).toBe(FacingModes.USER);
  });
});
