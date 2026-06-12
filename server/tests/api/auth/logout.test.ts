import getResCookieValue from "#tests/api/utils/getResCookieValue.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import app from "#utils/app.ts";
import { ApiRoutes } from "@speak-up/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";

const route = ApiRoutes.LOGOUT;

describe(`${route} POST route`, () => {
  setupDbCleanup();

  it("should properly clear refresh cookie (logout of an account)", async () => {
    const { cookieHeader } = await createAuthUser(getUniqueMockUserWithoutId());
    const res = await request(app)
      .post(route)
      .set("Cookie", cookieHeader)
      .send();

    expect(res.status).toBe(200);
    expect(getResCookieValue(res, "refreshToken")).toBe("");
  });

  it("should silently 'ignore' request if no cookies were provided", async () => {
    const res = await request(app).post(route).send();

    expect(res.status).toBe(200);
    expect(getResCookieValue(res, "refreshToken")).toBe("");
  });
});
