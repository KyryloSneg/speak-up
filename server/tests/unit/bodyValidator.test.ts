import expectApiError from "#tests/utils/expectApiError.ts";
import bodyValidator from "#validators/bodyValidator.ts";
import { getZodMediaConfigValidation } from "@speak-up/shared";
import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("bodyValidator", () => {
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

  const baseBody = { audio: true, video: true } as const;

  describe("successful validation", () => {
    it("should successfully continue request chain (call next()) if all required fields are provided", async () => {
      const { req, res, next } = setupMockReqContext();
      const validator = bodyValidator(getZodMediaConfigValidation());

      await validator(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
      expect(req.body).toStrictEqual(baseBody);
    });
  });

  describe("unsuccessful validation", () => {
    it("should throw a 400 api error if an empty body is provided", async () => {
      const { req, res, next } = setupMockReqContext({});
      const validator = bodyValidator(getZodMediaConfigValidation());

      await expectApiError(
        async () => await validator(req, res, next),
        400,
        "Validation error",
        expect.arrayContaining([
          expect.objectContaining({
            path: ["audio"],
            message: "Invalid audio",
          }),
          expect.objectContaining({
            path: ["video"],
            message: "Invalid video",
          }),
        ]),
      );
    });

    it("should throw a 400 api error if not all required fields are provided", async () => {
      const { req, res, next } = setupMockReqContext({ audio: true });
      const validator = bodyValidator(getZodMediaConfigValidation());

      await expectApiError(
        async () => await validator(req, res, next),
        400,
        "Validation error",
        expect.arrayContaining([
          expect.objectContaining({
            path: ["video"],
            message: "Invalid video",
          }),
        ]),
      );
    });

    it("should throw a 400 api error if a required field is undefined", async () => {
      const { req, res, next } = setupMockReqContext({
        ...baseBody,
        video: undefined,
      });

      const validator = bodyValidator(getZodMediaConfigValidation());
      await expectApiError(
        async () => await validator(req, res, next),
        400,
        "Validation error",
        expect.arrayContaining([
          expect.objectContaining({
            path: ["video"],
            message: "Invalid video",
          }),
        ]),
      );
    });

    it("should throw a 400 api error if redundant fields are provided", async () => {
      const { req, res, next } = setupMockReqContext({
        ...baseBody,
        extra: "extra",
      });

      const validator = bodyValidator(getZodMediaConfigValidation());
      await expectApiError(
        async () => await validator(req, res, next),
        400,
        "Validation error",
      );
    });

    it("should throw a 422 api error if all provided values are invalid", async () => {
      const { req, res, next } = setupMockReqContext({
        audio: "true",
        video: null,
      });

      const validator = bodyValidator(getZodMediaConfigValidation());
      await expectApiError(
        async () => await validator(req, res, next),
        422,
        "Validation error",
        expect.arrayContaining([
          expect.objectContaining({
            path: ["audio"],
            message: "Invalid audio",
          }),
          expect.objectContaining({
            path: ["video"],
            message: "Invalid video",
          }),
        ]),
      );
    });

    it("should throw a 422 api error if not all provided values are valid", async () => {
      const { req, res, next } = setupMockReqContext({
        audio: true,
        video: null,
      });

      const validator = bodyValidator(getZodMediaConfigValidation());
      await expectApiError(
        async () => await validator(req, res, next),
        422,
        "Validation error",
        expect.arrayContaining([
          expect.objectContaining({
            path: ["video"],
            message: "Invalid video",
          }),
        ]),
      );
    });
  });
});
