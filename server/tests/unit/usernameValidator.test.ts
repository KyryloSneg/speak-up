import expectApiError from "#tests/utils/expectApiError.ts";
import usernameValidator from "#validators/usernameValidator.ts";
import * as shared from "@speak-up/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@speak-up/shared", () => ({
  getZodUsernameValidation: vi.fn(),
}));

const sharedModule = vi.mocked(shared, true);

describe("usernameValidator", () => {
  const { getZodUsernameValidation } = sharedModule;
  const username = "username";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true if username validation is successful", () => {
    getZodUsernameValidation.mockReturnValue({
      safeParse: () => ({ success: true }),
    } as any);

    const isValid = usernameValidator(username);
    expect(isValid).toBe(true);
  });

  it("should throw 422 ApiError if username validation is not successful", () => {
    getZodUsernameValidation.mockReturnValue({
      safeParse: () => ({ success: false }),
    } as any);

    expectApiError(() => usernameValidator(username), 422);
  });
});
