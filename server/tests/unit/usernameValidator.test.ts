import expectApiError from "#tests/utils/expectApiError.ts";
import usernameValidator from "#validators/usernameValidator.ts";
import { describe, expect, it } from "vitest";

describe("usernameValidator", () => {
  it("should return true if username validation is successful", () => {
    const isValid = usernameValidator("username");
    expect(isValid).toBe(true);
  });

  it("should throw 422 ApiError if username validation is not successful", () => {
    expectApiError(() => usernameValidator(""), 422);
  });
});
