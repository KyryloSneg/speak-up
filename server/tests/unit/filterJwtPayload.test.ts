import type { JWTPayloadRaw } from "#types/jwtPayload.ts";
import filterJwtPayload from "#utils/filterJwtPayload.ts";
import { describe, expect, it } from "vitest";

describe("filterJwtPayload", () => {
  const mockPayload: JWTPayloadRaw = { userId: "userId" };

  it("should successfully filter out jwt payload from junk", () => {
    const filteredPayload = filterJwtPayload({
      ...mockPayload,
      junk: "junk",
    } as any);

    expect(filteredPayload).toStrictEqual(mockPayload);
  });

  it("should successfully leave clean jwt payload as is", () => {
    const filteredPayload = filterJwtPayload(mockPayload);
    expect(filteredPayload).toStrictEqual(mockPayload);
  });
});
