import expectApiError from "#tests/utils/expectApiError.ts";
import bodyStructureValidator from "#validators/bodyStructureValidator.ts";
import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

describe("bodyStructureValidator", () => {
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
    a: "",
    b: 0,
    c: null,
    d: false,
    e: true,
    f: "f",
    g: 1,
  } as const;

  const baseUnstrictBody = { ...baseStrictBody, h: "h" } as const;

  describe("successful structure validation", () => {
    it("should successfully continue request chain (call next()) if all required fields are provided (strict mode on)", async () => {
      const { req, res, next } = setupMockReqContext();
      const [validation, middleware] = bodyStructureValidator(
        Object.keys(baseStrictBody),
      );

      await validation.run(req);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it("should successfully continue request chain (call next()) if all required fields with redundant ones are provided (strict mode off)", async () => {
      const { req, res, next } = setupMockReqContext(baseUnstrictBody);
      const [validation, middleware] = bodyStructureValidator(
        Object.keys(baseStrictBody),
        false,
      );

      await validation.run(req);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe("unsuccessful structure validation", () => {
    it("should throw a 400 api error if an empty body is provided", async () => {
      const { req, res, next } = setupMockReqContext({});
      const [validation, middleware] = bodyStructureValidator(
        Object.keys(baseStrictBody),
      );

      await validation.run(req);
      expectApiError(() => middleware(req, res, next), 400);
    });

    it("should throw a 400 api error if not all required fields are provided", async () => {
      const { req, res, next } = setupMockReqContext({ a: "", b: 0 });
      const [validation, middleware] = bodyStructureValidator(
        Object.keys(baseStrictBody),
      );

      await validation.run(req);
      expectApiError(() => middleware(req, res, next), 400);
    });

    it("should throw a 400 api error if a required field is undefined", async () => {
      const { req, res, next } = setupMockReqContext({
        ...baseStrictBody,
        a: undefined,
      });

      const [validation, middleware] = bodyStructureValidator(
        Object.keys(baseStrictBody),
      );

      await validation.run(req);
      expectApiError(() => middleware(req, res, next), 400);
    });

    it("should throw a 400 api error if redundant fields are provided (strict mode on)", async () => {
      const { req, res, next } = setupMockReqContext(baseUnstrictBody);
      const [validation, middleware] = bodyStructureValidator(
        Object.keys(baseStrictBody),
      );

      await validation.run(req);
      expectApiError(() => middleware(req, res, next), 400);
    });
  });
});
