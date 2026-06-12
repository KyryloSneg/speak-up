import getUserRoom from "#utils/getUserRoom.ts";
import { describe, expect, it } from "vitest";

describe("getUserRoom", () => {
  it("should pass if a valid userId is provided", () => {
    const userId = "userId";
    const userRoom = getUserRoom(userId);

    expect(userRoom).toBe(`user-${userId}`);
  });
});
