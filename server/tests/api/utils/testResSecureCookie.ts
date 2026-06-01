import { DEFAULT_SECURE_COOKIES } from "#tests/utils/consts.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

function testResSecureCookie(res: Response): void {
  const cookieHeader = res.headers["set-cookie"]?.[0];

  DEFAULT_SECURE_COOKIES.forEach(secureCookie =>
    expect(cookieHeader).toContain(secureCookie),
  );
}

export default testResSecureCookie;
