import setCookie from "#services/setCookie.ts";
import UserService from "#services/userService.ts";
import type { AuthRequest } from "#types/request.ts";
import { REFRESH_TOKEN_EXPIRATION_TIME_DAYS } from "#utils/consts.ts";
import type {
  ChangeNicknameRequestBody,
  ChangeNicknameResponseBody,
  LogoutResponseBody,
  RefreshResponseBody,
  RegisterRequestBody,
  RegisterResponseBody,
  SignInRequestBody,
  SignInResponseBody,
} from "@speak-up/shared";
import type { NextFunction, Request, Response } from "express";

class UserController {
  static setRefreshToken(res: Response, refreshToken: string): void {
    setCookie(res, "refreshToken", refreshToken, {
      maxAge: REFRESH_TOKEN_EXPIRATION_TIME_DAYS * 24 * 60 * 60 * 1000,
    });
  }

  static async register(
    req: Request<
      Record<string, never>,
      RegisterResponseBody,
      RegisterRequestBody
    >,
    res: Response<RegisterResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { nickname, username, password } = req.body;
      const userData = await UserService.register(nickname, username, password);

      UserController.setRefreshToken(res, userData.tokens.refreshToken);

      res.status(201).json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async login(
    req: Request<Record<string, never>, SignInResponseBody, SignInRequestBody>,
    res: Response<SignInResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { username, password } = req.body;
      const userData = await UserService.login(username, password);

      UserController.setRefreshToken(res, userData.tokens.refreshToken);

      res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async logout(
    req: Request<Record<string, never>, LogoutResponseBody, never>,
    res: Response<LogoutResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      const token = await UserService.logout(refreshToken);

      res.clearCookie("refreshToken");

      res.json(token);
    } catch (e) {
      next(e);
    }
  }

  static async refresh(
    req: Request<Record<string, never>, RefreshResponseBody, never>,
    res: Response<RefreshResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      const userData = await UserService.refresh(refreshToken);

      UserController.setRefreshToken(res, userData.tokens.refreshToken);

      res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async changeNickname(
    req: AuthRequest<
      Record<string, never>,
      ChangeNicknameResponseBody,
      ChangeNicknameRequestBody
    >,
    res: Response<ChangeNicknameResponseBody>,
    next: NextFunction,
  ): Promise<Response | undefined> {
    try {
      const { nickname } = req.body;
      const userData = await UserService.changeNickname(nickname, req.userId);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
}

export default UserController;
