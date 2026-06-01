import type { Response } from "supertest";

function getResCookieValue(res: Response, name: string): string | undefined {
  const cookieHeaders = res.headers["set-cookie"];
  if (!cookieHeaders) return undefined;

  for (const header of cookieHeaders) {
    const targetCookie = header
      .split("; ")
      .find(cookie => cookie.startsWith(`${name}=`));

    if (targetCookie) {
      return targetCookie.split("=")[1];
    }
  }

  return undefined;
}

export default getResCookieValue;
