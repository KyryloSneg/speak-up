import ApiError from "#errors/ApiError.ts";
import type { JWTPayload } from "#types/jwtPayload.ts";
import type { AuthRequest, OptionalAuthRequest } from "#types/request.ts";
import { getSymmetricSecret } from "@speak-up/shared";
import type { NextFunction, Response } from "express";
import { jwtVerify } from "jose";

async function authMiddleware(
  req: OptionalAuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorizationHeader = req.get("Authorization");
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const [, token] = authorizationHeader.split("Bearer ");
    if (!token) {
      return next(ApiError.UnauthorizedError());
    }

    let userId = "";
    try {
      const { payload: jwtPayload } = await jwtVerify<JWTPayload>(
        token,
        getSymmetricSecret(process.env.JWT_ACCESS_SECRET),
      );

      userId = jwtPayload.userId;
      if (!userId) return next(ApiError.UnauthorizedError());
    } catch {
      return next(ApiError.UnauthorizedError());
    }

    (req as AuthRequest).userId = userId;
    next();
  } catch (e) {
    next(e);
  }
}

export default authMiddleware;
