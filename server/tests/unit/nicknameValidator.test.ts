import expectApiError from "#tests/utils/expectApiError.ts";
import nicknameValidator from "#validators/nicknameValidator.ts";
import { describe, expect, it } from "vitest";

describe("usernameValidator", () => {
  it("should return true if nickname validation is successful", () => {
    const isValid = nicknameValidator("nickname");
    expect(isValid).toBe(true);
  });

  it("should throw 422 ApiError if nickname validation is not successful", () => {
    expectApiError(() => nicknameValidator(""), 422);
  });
});
