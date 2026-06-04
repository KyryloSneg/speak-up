import type { NextFunction, Request, Response } from "express";

export type APIRequestHandler<T extends Request = Request, U = void> = (
  req: T,
  res: Response,
  next: NextFunction,
) => U;
