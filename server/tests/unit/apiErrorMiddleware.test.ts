import ApiError from "#errors/ApiError.ts";
import apiErrorMiddleware from "#middlewares/api/apiErrorMiddleware.ts";
import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

describe("apiErrorMiddleware", () => {
  function setupMockReqContext(): {
    req: Request;
    res: Response;
    next: NextFunction;
  } {
    const req = {} as Request;
    const res = {} as Response;

    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);

    const next = vi.fn() as NextFunction;

    return { req, res, next };
  }

  it("should properly return a response with a thrown ApiError's status + message", () => {
    const { req, res, next } = setupMockReqContext();

    const message = "Bad Request";
    const body = { reason: "reason" } as const;

    const error = ApiError.BadRequest(message, body);
    apiErrorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message, body });
  });

  it("should properly return a 500 response if an unexpected error is thrown", () => {
    const { req, res, next } = setupMockReqContext();

    const error = new Error("Unexpected error");
    apiErrorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });
});
