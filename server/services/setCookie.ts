import type { CookieOptions, Response } from "express";

function setCookie(
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  res.cookie(name, value, {
    ...options,
    secure: true,
    sameSite: "none",
    httpOnly: true,
  });
}

export default setCookie;
