import mapToUserDto from "#dtos/userDto.ts";
import ApiError from "#errors/ApiError.ts";
import type { User } from "#generated/prisma/client.ts";
import prisma from "#services/prisma.ts";
import getResCookieValue from "#tests/api/utils/getResCookieValue.ts";
import testResSecureCookie from "#tests/api/utils/testResSecureCookie.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import app from "#utils/app.ts";
import { ApiRoutes } from "@speak-up/shared";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

const route = ApiRoutes.REGISTER;

describe(`${route} POST route`, () => {
  setupDbCleanup();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("valid user credentials", () => {
    function getUniqueUserCredentials(): {
      username: string;
      nickname: string;
      password: string;
    } {
      return {
        username: `username_${crypto.randomUUID().slice(0, 16)}`,
        nickname: "nickname",
        password: "Pass#12?",
      };
    }

    it("should successfully create a user with a unique username and hashed password, set refresh token and return user dto", async () => {
      const credentials = getUniqueUserCredentials();
      const res = await request(app).post(route).send(credentials);

      expect(res.status).toBe(201);

      expect(getResCookieValue(res, "refreshToken")).not.toBeUndefined();
      expect(getResCookieValue(res, "refreshToken")).not.toBe("");

      testResSecureCookie(res);

      expect(res.body).toHaveProperty("tokens");
      expect(res.body).toHaveProperty("user");

      expect(res.body.tokens).toHaveProperty("accessToken");
      expect(res.body.tokens).toHaveProperty("refreshToken");

      expect(res.body.user).toStrictEqual(mapToUserDto(res.body.user));

      expect(res.body.user.username).toBe(credentials.username);
      expect(res.body.user.nickname).toBe(credentials.nickname);

      const dbUser = await prisma.user.findUnique({
        where: { username: credentials.username },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.password).not.toBe(credentials.password);
      expect(mapToUserDto(dbUser!)).toStrictEqual(res.body.user);

      const dbToken = await prisma.token.findUnique({
        where: { refreshToken: res.body.tokens.refreshToken },
      });

      expect(dbToken).not.toBeNull();
      expect(dbToken?.userId).toBe(res.body.user.id);
      expect(dbToken?.refreshToken).toBe(res.body.tokens.refreshToken);
    });

    it("should return a 400 response when trying to create a user with the duplicate username", async () => {
      const credentials = getUniqueUserCredentials();

      const res = await request(app).post(route).send(credentials);
      expect(res.status).toBe(201);

      const secondRes = await request(app).post(route).send(credentials);

      expect(secondRes.status).toBe(400);
      expect(secondRes.body.message).toBeTypeOf("string");
    });

    it("should return a proper 500 response on unexpected error", async () => {
      vi.spyOn(prisma.user, "create").mockRejectedValueOnce(
        new Error("Unexpected error"),
      );

      const credentials = getUniqueUserCredentials();
      const res = await request(app).post(route).send(credentials);

      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({
        message: ApiError.UnexpectedError().message,
      });
    });
  });

  describe("invalid user credentials", () => {
    it("should return a 400 response when not all credentials are sent", async () => {
      const credentials: Partial<User> = {
        username: "username",
        password: "Pass#12?",
      };

      const res = await request(app).post(route).send(credentials);

      expect(res.status).toBe(400);
      expect(res.body).toStrictEqual({
        message: "Validation error",
        body: expect.arrayContaining([
          expect.objectContaining({
            path: ["nickname"],
            message: "Invalid nickname",
          }),
        ]),
      });
    });

    it("should return a 400 response when redundant credentials are sent", async () => {
      const credentials: Partial<User & { extra: string }> = {
        username: "username",
        nickname: "nickname",
        password: "Pass#12?",
        extra: "extra",
      };

      const res = await request(app).post(route).send(credentials);

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 422 response on validation error", async () => {
      const credentials: Partial<User> = {
        username: "u",
        nickname: "",
        password: "pass#12?",
      };

      const res = await request(app).post(route).send(credentials);

      expect(res.status).toBe(422);
      expect(res.body.message).toBeTypeOf("string");

      expect(res.body).toStrictEqual({
        message: "Validation error",
        body: expect.arrayContaining([
          expect.objectContaining({
            path: ["nickname"],
            message: "Required",
          }),
          expect.objectContaining({
            path: ["username"],
            message: "Username is too short",
          }),
          expect.objectContaining({
            path: ["password"],
            message: "Must contain at least one uppercase letter",
          }),
        ]),
      });
    });
  });
});
