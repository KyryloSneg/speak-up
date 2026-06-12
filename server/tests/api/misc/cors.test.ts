import app from "#utils/app.ts";
import { ApiRoutes } from "@speak-up/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";

const route = ApiRoutes.SIGN_IN;

describe("Server API (express.js) CORS Policy", () => {
  it("should allow whitelisted origin to make requests", async () => {
    const res = await request(app)
      .get(route)
      .set("Origin", process.env.CLIENT_URL!);

    expect(res.headers["access-control-allow-origin"]).toBe(
      process.env.CLIENT_URL,
    );
  });

  it("should disallow non-whitelisted origin to make requests", async () => {
    const thirdPartyOrigin = "http://3rd-party.com";
    const res = await request(app).get(route).set("Origin", thirdPartyOrigin);

    expect(res.headers["access-control-allow-origin"]).not.toBe(
      thirdPartyOrigin,
    );
  });
});
