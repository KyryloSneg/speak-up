import expectApiError from "#tests/utils/expectApiError.ts";
import signInBodyStructureValidator from "#validators/signInBodyStructureValidator.ts";
import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

describe("signInBodyStructureValidator", () => {
  function setupMockReqContext(
    body: Record<string, unknown> = baseStrictBody,
  ): { req: Request; res: Response; next: NextFunction } {
    const req = {
      body,
    } as Request;

    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    return { req, res, next };
  }

  const baseStrictBody = {
    username: "username",
    password: "password",
  } as const;

  const baseUnstrictBody = {
    ...baseStrictBody,
    redundant: "redundant",
  } as const;

  describe("successful structure validation", () => {
    it("should successfully continue request chain (call next()) if valid body is passed", async () => {
      const { req, res, next } = setupMockReqContext();
      const [validation, middleware] = signInBodyStructureValidator();

      await validation.run(req);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe("unsuccessful structure validation", () => {
    it("should throw a 400 api error if invalid body is passed", async () => {
      const { req, res, next } = setupMockReqContext(baseUnstrictBody);
      const [validation, middleware] = signInBodyStructureValidator();

      await validation.run(req);
      expectApiError(() => middleware(req, res, next), 400);
    });
  });
});
