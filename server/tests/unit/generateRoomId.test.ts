import generateRoomId, { roomIdAlphabet } from "#utils/generateRoomId.ts";
import { describe, expect, it } from "vitest";

describe("generateRoomId", () => {
  it("should generate a valid roomd id string", () => {
    const roomId = generateRoomId();

    expect(roomId).toBeTypeOf("string");
    expect(roomId).toHaveLength(12);

    expect(
      roomId.split("").every(char => (roomIdAlphabet + "-").includes(char)),
    ).toBe(true);
  });
});
