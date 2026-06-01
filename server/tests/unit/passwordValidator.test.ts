import expectApiError from "#tests/utils/expectApiError.ts";
import passwordValidator from "#validators/passwordValidator.ts";
import * as shared from "@speak-up/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@speak-up/shared", () => ({
  getZodPasswordValidation: vi.fn(),
}));

const sharedModule = vi.mocked(shared, true);

describe("passwordValidator", () => {
  const { getZodPasswordValidation } = sharedModule;
  const password = "password";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true if password validation is successful", () => {
    getZodPasswordValidation.mockReturnValue({
      safeParse: () => ({ success: true }),
    } as any);

    const isValid = passwordValidator(password);
    expect(isValid).toBe(true);
  });

  it("should throw 422 ApiError if password validation is not successful", () => {
    getZodPasswordValidation.mockReturnValue({
      safeParse: () => ({ success: false }),
    } as any);

    expectApiError(() => passwordValidator(password), 422);
  });
});
