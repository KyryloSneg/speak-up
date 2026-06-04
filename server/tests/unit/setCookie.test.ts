import setCookie from "#services/setCookie.ts";
import { DEFAULT_SECURE_COOKIES } from "#tests/utils/consts.ts";
import type { CookieOptions, Response } from "express";
import { describe, expect, it } from "vitest";

describe("setCookie", () => {
  function createMockRes(): Response {
    const headers = new Map<string, string[]>();

    return {
      cookie(name: string, value: string, options: CookieOptions = {}) {
        const parts = [`${name}=${value}`];

        if (options.httpOnly) parts.push("HttpOnly");
        if (options.secure) parts.push("Secure");

        if (options.sameSite) {
          const sameSiteValue =
            typeof options.sameSite === "string"
              ? options.sameSite.charAt(0).toUpperCase() +
                options.sameSite.slice(1)
              : "Strict";
          parts.push(`SameSite=${sameSiteValue}`);
        }

        if (options.maxAge !== undefined) {
          parts.push(`Max-Age=${Math.round(options.maxAge / 1000)}`);
        }

        const cookieString = parts.join("; ");

        const existing = headers.get("set-cookie") || [];
        existing.push(cookieString);
        headers.set("set-cookie", existing);

        return this;
      },

      getHeader(name: string) {
        const key = name.toLowerCase();
        const values = headers.get(key);
        if (!values) return undefined;

        return values.length === 1 ? values[0] : values;
      },
    } as unknown as Response;
  }

  function checkIsOurCookieWithDefaultOptions(
    res: Response,
    name: string,
    value: string,
    cookieAdditionalCheckCb?: (cookie: string) => boolean,
  ): boolean {
    const setCookieHeader = res.getHeader("Set-Cookie");
    const cookiesArray = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : typeof setCookieHeader === "string"
        ? [setCookieHeader]
        : [];

    return cookiesArray.some(
      cookie =>
        cookie.startsWith(`${name}=${value}`) &&
        DEFAULT_SECURE_COOKIES.every(secureCookie =>
          cookie.includes(secureCookie),
        ) &&
        (!cookieAdditionalCheckCb || cookieAdditionalCheckCb(cookie)),
    );
  }

  it("should properly set cookie with default security options", () => {
    const res = createMockRes();
    const name = "name";
    const value = "value";

    setCookie(res, name, value);
    expect(checkIsOurCookieWithDefaultOptions(res, name, value)).toBe(true);
  });

  it("should properly set cookie with custom options + MANDATORY default security options", () => {
    const res = createMockRes();
    const name = "name";
    const value = "value";
    const additionalOptions: CookieOptions = {
      maxAge: 10000,
      secure: false,
    } as const;

    setCookie(res, name, value, additionalOptions);
    expect(
      checkIsOurCookieWithDefaultOptions(res, name, value, cookie =>
        cookie.includes(
          `Max-Age=${Math.round(additionalOptions.maxAge! / 1000)}`,
        ),
      ),
    ).toBe(true);
  });
});
