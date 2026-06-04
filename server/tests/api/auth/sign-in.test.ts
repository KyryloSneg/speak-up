import mapToUserDto from "#dtos/userDto.ts";
import type { User } from "#generated/prisma/client.ts";
import prisma from "#services/prisma.ts";
import createAuthUser from "#tests/api/utils/createAuthUser.ts";
import getResCookieValue from "#tests/api/utils/getResCookieValue.ts";
import testResSecureCookie from "#tests/api/utils/testResSecureCookie.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import app from "#utils/app.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

describe("/api/sign-in POST route", () => {
  setupDbCleanup();

  function getUniqueUserCredentials(): Omit<User, "id"> {
    return {
      username: `username_${crypto.randomUUID().slice(0, 16)}`,
      nickname: "nickname",
      picture: "picture",
      letterPicture: "letterPicture",
      password: "Pass#12?",
    };
  }

  describe("successful sign in", () => {
    it("should successfully sign into an existing account, generate new jwt tokens and return user dto", async () => {
      const credentials = getUniqueUserCredentials();
      const { user, tokens } = await createAuthUser(credentials);

      const newSystemDate = new Date();
      newSystemDate.setSeconds(newSystemDate.getSeconds() + 2);

      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(newSystemDate);

      const res = await request(app).post("/api/sign-in").send({
        username: credentials.username,
        password: credentials.password,
      });

      vi.useRealTimers();

      expect(res.status).toBe(200);

      expect(getResCookieValue(res, "refreshToken")).not.toBeUndefined();
      expect(getResCookieValue(res, "refreshToken")).not.toBe("");

      testResSecureCookie(res);

      expect(res.body).toHaveProperty("tokens");
      expect(res.body).toHaveProperty("user");

      expect(res.body.tokens).toHaveProperty("accessToken");
      expect(res.body.tokens).toHaveProperty("refreshToken");

      expect(res.body.tokens.refreshToken).not.toBe(tokens.refreshToken);
      expect(res.body.tokens.accessToken).not.toBe(tokens.accessToken);

      expect(res.body.user).toEqual(mapToUserDto(res.body.user));
      expect(res.body.user).toEqual(mapToUserDto(user));

      const dbUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      expect(dbUser).not.toBeNull();
      expect(mapToUserDto(dbUser!)).toEqual(res.body.user);

      const dbToken = await prisma.token.findUnique({
        where: { refreshToken: res.body.tokens.refreshToken },
      });

      expect(dbToken).not.toBeNull();
      expect(dbToken?.userId).toBe(res.body.user.id);

      expect(dbToken?.refreshToken).toBe(res.body.tokens.refreshToken);
      expect(dbToken?.refreshToken).not.toBe(tokens.refreshToken);
    });
  });

  describe("unsuccessful sign in", () => {
    it("should return a 400 response if user with such an username doesn't exist", async () => {
      const res = await request(app)
        .post("/api/sign-in")
        .send({ username: "randomUsername", password: "Pass#12?" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 400 response if an incorrect password is provided", async () => {
      const credentials = getUniqueUserCredentials();
      await createAuthUser(credentials);

      const res = await request(app)
        .post("/api/sign-in")
        .send({
          username: credentials.username,
          password: `${credentials.password}1`,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 400 response if not all credentials are provided", async () => {
      const credentials = getUniqueUserCredentials();
      await createAuthUser(credentials);

      const res = await request(app)
        .post("/api/sign-in")
        .send({ username: credentials.username });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 400 response if a redundant field is provided", async () => {
      const credentials = getUniqueUserCredentials();
      await createAuthUser(credentials);

      const res = await request(app).post("/api/sign-in").send({
        username: credentials.username,
        password: credentials.password,
        extra: "extra",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 422 response on validation error", async () => {
      const res = await request(app)
        .post("/api/sign-in")
        .send({ username: "u", password: "pass#12?" });

      expect(res.status).toBe(422);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 500 response on an unexpected error", async () => {
      const credentials = getUniqueUserCredentials();
      await createAuthUser(credentials);

      vi.spyOn(prisma.user, "findUnique").mockRejectedValueOnce(
        new Error("Unexpected error"),
      );

      const res = await request(app).post("/api/sign-in").send({
        username: credentials.username,
        password: credentials.password,
      });

      vi.resetAllMocks();

      expect(res.status).toBe(500);
      expect(res.body.message).toBeTypeOf("string");
    });
  });
});
