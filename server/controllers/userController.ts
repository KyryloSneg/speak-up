import ApiError from "#errors/ApiError.ts";
import setCookie from "#services/setCookie.ts";
import UserService from "#services/userService.ts";
import type { AuthRequest } from "#types/request.ts";
import { REFRESH_TOKEN_EXPIRATION_TIME_DAYS } from "#utils/consts.ts";
import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

class UserController {
  static setRefreshToken(res: Response, refreshToken: string): void {
    setCookie(res, "refreshToken", refreshToken, {
      maxAge: REFRESH_TOKEN_EXPIRATION_TIME_DAYS * 24 * 60 * 60 * 1000,
    });
  }

  static async registration(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.UnprocessableEntity("Validation error", errors.array()));
        return;
      }

      const { nickname, username, password } = req.body;
      const userData = await UserService.registration(
        nickname,
        username,
        password,
      );

      UserController.setRefreshToken(res, userData.tokens.refreshToken);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.UnprocessableEntity("Validation error", errors.array()));
        return;
      }

      const { username, password } = req.body;
      const userData = await UserService.login(username, password);

      UserController.setRefreshToken(res, userData.tokens.refreshToken);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    try {
      const { refreshToken } = req.cookies;
      const token = await UserService.logout(refreshToken);

      res.clearCookie("refreshToken");

      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    try {
      const { refreshToken } = req.cookies;
      const userData = await UserService.refresh(refreshToken);

      UserController.setRefreshToken(res, userData.tokens.refreshToken);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async changeNickname(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.UnprocessableEntity("Validation error", errors.array()));
        return;
      }

      const { nickname } = req.body;
      const userData = await UserService.changeNickname(nickname, req.userId);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
}

export default UserController;
