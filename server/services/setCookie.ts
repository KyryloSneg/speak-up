import type { CookieOptions, Response } from "express";

export const DEFAULT_COOKIE_SECURITY_OPTIONS: CookieOptions = {
  secure: true,
  sameSite: "none",
  httpOnly: true,
} as const;

function setCookie(
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  res.cookie(name, value, {
    ...options,
    ...DEFAULT_COOKIE_SECURITY_OPTIONS,
  });
}

export default setCookie;
