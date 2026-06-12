import ApiError from "#errors/ApiError.ts";
import type { NextFunction, Request, Response } from "express";

function apiErrorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
      ...(error.body ? { body: error.body } : {}),
    });
  }

  return res.status(500).json({ message: ApiError.UnexpectedError().message });
}

export default apiErrorMiddleware;
