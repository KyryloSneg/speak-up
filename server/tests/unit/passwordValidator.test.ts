import expectApiError from "#tests/utils/expectApiError.ts";
import passwordValidator from "#validators/passwordValidator.ts";
import { describe, expect, it } from "vitest";

describe("passwordValidator", () => {
  it("should return true if password validation is successful", () => {
    const isValid = passwordValidator("Pass#12?");
    expect(isValid).toBe(true);
  });

  it("should throw 422 ApiError if password validation is not successful", () => {
    expectApiError(() => passwordValidator("password"), 422);
  });
});
