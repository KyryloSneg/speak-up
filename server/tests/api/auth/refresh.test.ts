import getResCookieValue from "#tests/api/utils/getResCookieValue.ts";
import testPrivateRoute from "#tests/api/utils/testPrivateRoute.ts";
import testResSecureCookie from "#tests/api/utils/testResSecureCookie.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import app from "#utils/app.ts";
import { ApiRoutes } from "@speak-up/shared";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const route = ApiRoutes.REFRESH;

describe(`${route} GET route`, () => {
  setupDbCleanup();

  testPrivateRoute(route, "GET", { strategy: "refresh-only" });

  it("should refresh jwt tokens if an unexpired refresh token is present in the cookies", async () => {
    const { tokens, cookieHeader } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const newSystemDate = new Date();
    newSystemDate.setSeconds(newSystemDate.getSeconds() + 2);

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(newSystemDate);

    const res = await request(app)
      .get(route)
      .set("Cookie", cookieHeader)
      .send();

    vi.useRealTimers();

    expect(res.status).toBe(200);
    testResSecureCookie(res);

    expect(getResCookieValue(res, "refreshToken")).not.toBe(
      tokens.refreshToken,
    );
  });
});
