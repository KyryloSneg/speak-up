import ApiError from "#errors/ApiError.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import app from "#utils/app.ts";
import {
  ACCESS_TOKEN_EXPIRATION_TIME_MINUTES,
  REFRESH_TOKEN_EXPIRATION_TIME_DAYS,
} from "#utils/consts.ts";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Options {
  payload?: Record<string, unknown>;
  strategy?: "access-only" | "refresh-only" | "both";
}

function testPrivateRoute(
  route: string,
  method: Method,
  options: Options = {},
): void {
  const { payload, strategy = "access-only" } = options;
  const supertestMethod = method.toLowerCase() as Lowercase<Method>;

  describe(`private route checks of ${route} ${method} route`, () => {
    if (strategy === "both" || strategy === "access-only") {
      describe("mock jwt", () => {
        it("should throw 401 error with a message if no access token is provided", async () => {
          const res = await request(app)[supertestMethod](route).send(payload);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            message: ApiError.UnauthorizedError().message,
          });
        });

        it("should throw 401 error with a message if an invalid jwt access token with invalid structure is provided", async () => {
          const res = await request(app)
            [supertestMethod](route)
            .set("Authorization", "accessToken")
            .send(payload);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            message: ApiError.UnauthorizedError().message,
          });
        });

        it("should throw 401 error with a message if an invalid jwt access token with valid structure is provided", async () => {
          const res = await request(app)
            [supertestMethod](route)
            .set("Authorization", "Bearer accessToken")
            .send(payload);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            message: ApiError.UnauthorizedError().message,
          });
        });
      });
    }

    // always provide one of the real tokens here (the db cleanup is provided by consumer)
    describe("real jwt", () => {
      if (strategy === "both" || strategy === "access-only") {
        it("should throw 401 error with a message if a valid jwt access token with invalid structure is provided", async () => {
          const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
          const res = await request(app)
            [supertestMethod](route)
            .set("Authorization", `accessToken=${tokens.accessToken}`)
            .send(payload);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            message: ApiError.UnauthorizedError().message,
          });
        });
      }

      if (strategy === "both" || strategy === "refresh-only") {
        it("should throw 401 error with a message if a valid jwt access token with valid structure is provided with no refresh token", async () => {
          const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
          const res = await request(app)
            [supertestMethod](route)
            .set("Authorization", `accessToken=Bearer ${tokens.accessToken}`)
            .send(payload);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            message: ApiError.UnauthorizedError().message,
          });
        });

        it("should throw 401 error with a message if a valid jwt access token with valid structure is provided with an invalid refresh token", async () => {
          const { authorizationHeader } = await createAuthUser(
            getUniqueMockUserWithoutId(),
          );
          const res = await request(app)
            [supertestMethod](route)
            .set("Authorization", authorizationHeader)
            .set("Cookie", "refreshToken=refreshToken")
            .send(payload);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            message: ApiError.UnauthorizedError().message,
          });
        });
      }

      if (strategy === "both") {
        it("should throw 401 error with a message if a valid jwt refresh token is provided with no access token", async () => {
          const { cookieHeader } = await createAuthUser(
            getUniqueMockUserWithoutId(),
          );
          const res = await request(app)
            [supertestMethod](route)
            .set("Cookie", cookieHeader)
            .send(payload);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            message: ApiError.UnauthorizedError().message,
          });
        });
      }

      describe("jwt expiration boundaries", () => {
        afterEach(() => {
          vi.useRealTimers();
        });

        if (strategy === "both" || strategy === "access-only") {
          it("should throw 401 error with a message if an expired jwt access token is provided", async () => {
            const { authorizationHeader } = await createAuthUser(
              getUniqueMockUserWithoutId(),
            );

            const newSystemDate = new Date();
            newSystemDate.setMinutes(
              newSystemDate.getMinutes() +
                ACCESS_TOKEN_EXPIRATION_TIME_MINUTES +
                1,
            );

            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(newSystemDate);

            const res = await request(app)
              [supertestMethod](route)
              .set("Authorization", authorizationHeader)
              .send(payload);

            expect(res.status).toBe(401);
            expect(res.body).toStrictEqual({
              message: ApiError.UnauthorizedError().message,
            });
          });
        }

        if (strategy === "both" || strategy === "refresh-only") {
          it("should throw 401 error with a message if an expired jwt refresh token is provided", async () => {
            const { cookieHeader } = await createAuthUser(
              getUniqueMockUserWithoutId(),
            );

            const newSystemDate = new Date();
            newSystemDate.setDate(
              newSystemDate.getDate() + REFRESH_TOKEN_EXPIRATION_TIME_DAYS + 1,
            );

            vi.useFakeTimers({ toFake: ["Date"] });
            vi.setSystemTime(newSystemDate);

            const res = await request(app)
              [supertestMethod](route)
              .set("Cookie", cookieHeader)
              .send(payload);

            expect(res.status).toBe(401);
            expect(res.body).toStrictEqual({
              message: ApiError.UnauthorizedError().message,
            });
          });
        }
      });
    });
  });
}

export default testPrivateRoute;
