import mapToUserDto from "#dtos/userDto.ts";
import prisma from "#services/prisma.ts";
import createAuthUser from "#tests/api/utils/createAuthUser.ts";
import testPrivateRoute from "#tests/api/utils/testPrivateRoute.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import app from "#utils/app.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

describe("/api/change-nickname PATCH route", () => {
  setupDbCleanup();

  testPrivateRoute("/api/change-nickname", "PATCH", {
    strategy: "access-only",
  });

  describe("successful nickname change", () => {
    it("should successfully change nickname of an authenticated user and return user dto", async () => {
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = `${user.nickname}_123`;
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.status).toBe(200);

      expect(res.body).toEqual(mapToUserDto(res.body));
      expect(res.body).toEqual({
        ...mapToUserDto(user),
        nickname: newNickname,
      });

      expect(res.body.nickname).toBe(newNickname);
      expect(res.body.nickname).not.toBe(user.nickname);

      const dbUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.nickname).toBe(newNickname);
    });
  });

  describe("unsuccessful nickname change", () => {
    it("should return a 400 response if the new nickname isn't provided", async () => {
      const { authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 400 response if a redundant field is provided", async () => {
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = `${user.nickname}_123`;
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname, extra: "extra" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 422 response if the new nickname is invalid", async () => {
      const { authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = "";
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.status).toBe(422);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 500 response on an unexpected error", async () => {
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      vi.spyOn(prisma.user, "update").mockRejectedValueOnce(
        new Error("Unexpected error"),
      );

      const newNickname = `${user.nickname}_123`;
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      vi.resetAllMocks();

      expect(res.status).toBe(500);
      expect(res.body.message).toBeTypeOf("string");
    });
  });
});
