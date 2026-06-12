import expectApiError from "#tests/utils/expectApiError.ts";
import changeNicknameBodyValidator from "#validators/changeNicknameBodyValidator.ts";
import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("changeNicknameBodyValidator", () => {
  function setupMockReqContext(body: Record<string, unknown> = baseBody): {
    req: Request;
    res: Response;
    next: NextFunction;
  } {
    const req = {
      body,
    } as Request;

    const res = {} as Response;
    const next = vi.fn((e: unknown) => {
      if (e instanceof Error) throw e;
    }) as unknown as NextFunction;

    return { req, res, next };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseBody = {
    nickname: "nickname",
  } as const;

  describe("successful validation", () => {
    it("should successfully continue request chain (call next()) if all required fields are provided", async () => {
      const { req, res, next } = setupMockReqContext();
      const validator = changeNicknameBodyValidator();

      await validator(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
      expect(req.body).toStrictEqual(baseBody);
    });
  });

  describe("unsuccessful validation", () => {
    it("should throw a 400 api error if an empty body is provided", async () => {
      const { req, res, next } = setupMockReqContext({});
      const validator = changeNicknameBodyValidator();

      await expectApiError(
        async () => await validator(req, res, next),
        400,
        "Validation error",
        expect.arrayContaining([
          expect.objectContaining({
            path: ["nickname"],
            message: "Invalid nickname",
          }),
        ]),
      );
    });

    it("should throw a 400 api error if a redundant field is provided", async () => {
      const { req, res, next } = setupMockReqContext({
        ...baseBody,
        extra: "extra",
      });

      const validator = changeNicknameBodyValidator();
      await expectApiError(
        async () => await validator(req, res, next),
        400,
        "Validation error",
      );
    });

    it("should throw a 422 api error if provided values are invalid", async () => {
      const { req, res, next } = setupMockReqContext({
        nickname: "",
      });

      const validator = changeNicknameBodyValidator();
      await expectApiError(
        async () => await validator(req, res, next),
        422,
        "Validation error",
        expect.arrayContaining([
          expect.objectContaining({
            path: ["nickname"],
            message: "Required",
          }),
        ]),
      );
    });
  });
});
