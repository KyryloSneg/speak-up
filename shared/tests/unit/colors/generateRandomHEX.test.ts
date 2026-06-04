import { describe, expect, it } from "vitest";
import generateRandomHEX from "../../../utils/generateRandomHEX.ts";

describe("generateRandomHEX", () => {
  it("should generate a valid HEX string", () => {
    const randomHEX = generateRandomHEX();

    expect(randomHEX).toBeTypeOf("string");
    const [hashtag, value] = [randomHEX[0], randomHEX.slice(1)];

    expect(hashtag).toBe("#");
    expect(value).toHaveLength(6);

    expect(
      value.split("").every(char => "0123456789ABCDEF".includes(char)),
    ).toBe(true);
  });
});
