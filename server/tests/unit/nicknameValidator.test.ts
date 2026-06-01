import expectApiError from "#tests/utils/expectApiError.ts";
import nicknameValidator from "#validators/nicknameValidator.ts";
import * as shared from "@speak-up/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@speak-up/shared", () => ({
  getZodNicknameValidation: vi.fn(),
}));

const sharedModule = vi.mocked(shared, true);

describe("usernameValidator", () => {
  const { getZodNicknameValidation } = sharedModule;
  const nickname = "nickname";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true if nickname validation is successful", () => {
    getZodNicknameValidation.mockReturnValue({
      safeParse: () => ({ success: true }),
    } as any);

    const isValid = nicknameValidator(nickname);
    expect(isValid).toBe(true);
  });

  it("should throw 422 ApiError if nickname validation is not successful", () => {
    getZodNicknameValidation.mockReturnValue({
      safeParse: () => ({ success: false }),
    } as any);

    expectApiError(() => nicknameValidator(nickname), 422);
  });
});
